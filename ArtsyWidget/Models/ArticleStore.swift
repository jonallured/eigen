import Foundation
import SwiftUI
import Combine

typealias ArticleStoreCompletionHandler = ([Article]) -> Void

class ArticleStore {
    static func fetch(completion: @escaping ArticleStoreCompletionHandler) {
        let store = ArticleStore()
        store.fetch(completion: completion)
    }
    
    var articles: [Article]?
    var cancellable: AnyCancellable?
    var completion: ArticleStoreCompletionHandler?
    
    let urlSession: URLSession
    
    init() {
        self.urlSession = URLSession.shared
    }
    
    func fetch(completion: @escaping ArticleStoreCompletionHandler) {
        self.completion = completion
        
        let rssUrl = "https://www.artsy.net/rss/news"

        guard
            let rssEndpoint = URL(string: rssUrl)
        else { return }

        let rssTask = urlSession.dataTask(with: URLRequest(url: rssEndpoint), completionHandler: handleRssTask)
        rssTask.resume()
    }
    
    func handleRssTask(data: Data?, response: URLResponse?, error: Error?) {
        guard let data = data else { return }
        
        let articles = ArticleParser.parse(data: data)
        
        self.articles = articles
        
        let imageUrls = articles.map { URL(string: $0.imageUrl)! }
        
        let publishers: [URLSession.DataTaskPublisher] = imageUrls.map() { imageUrl in
            let publisher = self.urlSession.dataTaskPublisher(for: imageUrl)
            return publisher
        }

        let cancellable = Publishers.Zip4(publishers[0], publishers[1], publishers[2], publishers[3])
            .sink(receiveCompletion: self.imagesComplete, receiveValue: self.parseOutputs)

        self.cancellable = cancellable
    }
    
    func parseOutputs(outputs: ZippedOutputs) {
        guard
            let completion = completion,
            let articles = articles
        else { return }
        
        let values = [outputs.0, outputs.1, outputs.2, outputs.3]
        let enhancedArticles: [Article] = values.compactMap() { (data, response) in
            guard
                var article = articles.first(where: { URL(string: $0.imageUrl)! == response.url }),
                let image = UIImage(data: data)
            else { return nil }
            
            article.image = image
            
            return article
        }
        
        completion(enhancedArticles)
    }
    
    func imagesComplete(status: PublisherCompletionStatus) {
        // i should be evaluating the two cases and doing something with failures...
        print(status)
    }
}
