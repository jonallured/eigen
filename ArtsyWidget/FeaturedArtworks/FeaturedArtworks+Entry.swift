import Foundation
import WidgetKit

extension FeaturedArtworks {
    struct Entry: TimelineEntry {
        let artwork: Artwork
        let date: Date
        
        static func fallback() -> Entry {
            let artwork = Artwork.fallback()
            let date = Date()
            let entry = Entry(artwork: artwork, date: date)
            
            return entry
        }
    }
}
