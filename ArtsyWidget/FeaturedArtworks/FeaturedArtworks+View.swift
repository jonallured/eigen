import Foundation
import SwiftUI
import WidgetKit

extension FeaturedArtworks {
    struct View: SwiftUI.View {
        static let supportedFamilies: [WidgetFamily] = [.systemLarge]
        
        let entry: Entry
        
        var artwork: Artwork {
            return entry.artwork
        }
        
        var body: some SwiftUI.View {
            let artworkImage = artwork.image!
            let artistName = artwork.artist.name
            let artworkTitle = artwork.title
            let artworkUrl = ArtworkUrl.from(slug: artwork.id)
            
            GeometryReader { geo in
                ZStack() {
                    Image(uiImage: artworkImage)
                        .resizable()
                        .scaledToFill()
                        .frame(width: geo.size.width, height: geo.size.height, alignment: .top)
                    VStack() {
                        Spacer()
                        VStack() {
                            PrimaryText(name: artistName, color: .white)
                                .lineLimit(1)
                                .frame(maxWidth: .infinity, alignment: .leading)
                            SecondaryText(title: artworkTitle, color: .white)
                                .lineLimit(1)
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }
                        .padding([.leading, .trailing, .bottom], 10)
                    }
                    .widgetURL(artworkUrl)
                }
            }
        }
    }
    
    
}

struct FeaturedArtworks_View_Previews: PreviewProvider {
    static var previews: some SwiftUI.View {
        let entry = FeaturedArtworks.Entry.fallback()
        let families = FeaturedArtworks.View.supportedFamilies
        
        Group {
            ForEach(families, id: \.self) { family in
                FeaturedArtworks.View(entry: entry)
                    .previewContext(WidgetPreviewContext(family: family))
            }
        }
    }
}
