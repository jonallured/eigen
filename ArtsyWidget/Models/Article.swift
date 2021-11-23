import Foundation
import UIKit

struct Article {
    var authorName: String
    var image: UIImage?
    var imageUrl: String
    var publishedAt: String
    var title: String
    var url: String

    init() {
        self.authorName = ""
        self.imageUrl = ""
        self.publishedAt = ""
        self.title = ""
        self.url = ""
    }
    
    mutating func resetProperties() {
        self = Article()
    }
    
    mutating func updateProperty(elementName: String, value: String) {
        switch elementName {
        case "author":
            authorName += value
        case "imageUrl":
            imageUrl = value
        case "link":
            url += value
        case "pubDate":
            publishedAt += value
        case "title":
            title += value
        default: break
        }
    }
}
