import Foundation

class ArticleParser: NSObject, XMLParserDelegate {
    static func parse(data: Data) -> [Article] {
        let parser = XMLParser(data: data)
        let articleParser = ArticleParser()
        parser.delegate = articleParser
        parser.parse()
        
        return articleParser.articles
    }
    
    var articles = [Article]()
    
    private var currentElement = ""
    private var article = Article()
    
    func parser(_ parser: XMLParser, didStartElement elementName: String, namespaceURI: String?, qualifiedName qName: String?, attributes attributeDict: [String : String] = [:]) {
        currentElement = elementName
        
        if currentElement == "item" {
            article.resetProperties()
        } else if currentElement == "enclosure" {
            let imageUrl = attributeDict["url"]!
            article.updateProperty(elementName: "imageUrl", value: imageUrl)
        }
    }
    
    func parser(_ parser: XMLParser, foundCharacters string: String) {
        let tagContent = string.trimmingCharacters(in: .whitespacesAndNewlines)
        article.updateProperty(elementName: currentElement, value: tagContent)
    }
    
    func parser(_ parser: XMLParser, didEndElement elementName: String, namespaceURI: String?, qualifiedName qName: String?) {
        if elementName == "item" {
            articles.append(article)
        }
    }
}
