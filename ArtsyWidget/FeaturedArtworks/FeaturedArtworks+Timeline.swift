import WidgetKit

extension FeaturedArtworks {
    struct Timeline {
        static func generate(completion: @escaping (WidgetKit.Timeline<Entry>) -> ()) {
            ArtworkStore.fetch() { artworks in
                let schedule = Schedule()
                let rotatedArtworks = Something.rotateArray(array: artworks)
                let updateTimesToArtworks = Array(zip(schedule.updateTimes, rotatedArtworks))
                let entries = updateTimesToArtworks.map() { (date, artworks) in Entry(artworks: artworks, date: date) }
                let timeline = WidgetKit.Timeline(entries: entries, policy: .after(schedule.nextUpdate))
                completion(timeline)
            }
        }
    }
}

struct Something {
    static func rotateArray(array: [Artwork]) -> [[Artwork]] {
        let initialLineup = array

        let nextLineups: [[Artwork]] = [0, 1, 2, 3].map() { offset in
            let trailing = Array(initialLineup.suffix(4 - offset))
            let leading = Array(initialLineup.prefix(offset))

            return trailing + leading
        }
        
        return nextLineups
    }
}
