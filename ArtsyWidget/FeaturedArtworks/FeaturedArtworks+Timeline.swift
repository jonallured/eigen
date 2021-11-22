import WidgetKit

extension FeaturedArtworks {
    struct Timeline {
        static func generate(completion: @escaping (WidgetKit.Timeline<Entry>) -> ()) {
            ArtworkStore.fetch() { artworks in
                let schedule = Schedule()
                let updateTimesToArtworks = Array(zip(schedule.updateTimes, artworks))
                let entries = updateTimesToArtworks.map() { (date, artwork) in Entry(artwork: artwork, date: date) }
                let timeline = WidgetKit.Timeline(entries: entries, policy: .after(schedule.nextUpdate))
                completion(timeline)
            }
        }
    }
}
