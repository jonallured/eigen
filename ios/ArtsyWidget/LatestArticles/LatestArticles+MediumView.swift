import SwiftUI
import WidgetKit

extension LatestArticles {
    struct MediumView: SwiftUI.View {
        static let supportedFamilies: [WidgetFamily] = [.systemMedium]
        
        let entry: Entry
        
        var body: some SwiftUI.View {
            if #available(iOSApplicationExtension 17.0, *) {
                actualBody().containerBackground(for: .widget) {
                    Color.white
                }
            } else {
                actualBody()
            }
        }
        
        func actualBody() -> some SwiftUI.View {
            let artsyLogo = UIImage(named: "BlackArtsyLogo")!
            let articles = entry.articles[0...1]
            let artsyUrl = WidgetUrl.from(link: "https://www.artsy.net")!
            
            return VStack() {
                HStack(alignment: .center) {
                    Link(destination: artsyUrl) {
                        Text("LATEST ARTICLES")
                            .foregroundColor(.black)
                            .font(.system(size: 10, weight: .medium))
                        Spacer()
                        Image(uiImage: artsyLogo)
                            .resizable()
                            .frame(width: 20, height: 20)
                    }
                }
                Spacer()
                VStack() {
                    ForEach(articles, id: \.url) { article in
                        Link(destination: article.url!) {
                            HStack(alignment: .center) {
                                Image(uiImage: article.image!)
                                    .resizable()
                                    .scaledToFill()
                                    .frame(width: 42, height: 42, alignment: .top)
                                    .clipped()
                                VStack() {
                                    PrimaryText(name: article.title)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                        .lineLimit(2)
                                    SecondaryText(title: article.pubDate)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                }
                            }
                        }
                    }
                }
            }
            .padding(16)
            .background(Color.white)
        }
    }
}

struct LatestArticles_MediumView_Previews: PreviewProvider {
    static var previews: some View {
        let entry = LatestArticles.Entry.fallback()
        let families = LatestArticles.MediumView.supportedFamilies
        
        Group {
            ForEach(families, id: \.self) { family in
                LatestArticles.MediumView(entry: entry)
                    .previewContext(WidgetPreviewContext(family: family))
            }
        }
    }
}
