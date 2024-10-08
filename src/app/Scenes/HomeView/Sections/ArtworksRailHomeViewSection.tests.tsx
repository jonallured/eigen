import { fireEvent, screen } from "@testing-library/react-native"
import { ArtworksRailHomeViewSectionTestsQuery } from "__generated__/ArtworksRailHomeViewSectionTestsQuery.graphql"
import { ArtworksRailHomeViewSection } from "app/Scenes/HomeView/Sections/ArtworksRailHomeViewSection"
import { navigate } from "app/system/navigation/navigate"
import { mockTrackEvent } from "app/utils/tests/globallyMockedStuff"
import { setupTestWrapper } from "app/utils/tests/setupTestWrapper"
import { graphql } from "react-relay"

describe("ArtworksRailHomeViewSection", () => {
  const { renderWithRelay } = setupTestWrapper<ArtworksRailHomeViewSectionTestsQuery>({
    Component: (props) => {
      if (!props.homeView.section) {
        return null
      }
      return <ArtworksRailHomeViewSection section={props.homeView.section} />
    },
    query: graphql`
      query ArtworksRailHomeViewSectionTestsQuery @relay_test_operation {
        homeView {
          section(id: "home-view-section-new-works-for-you") {
            ... on ArtworksRailHomeViewSection {
              ...ArtworksRailHomeViewSection_section
            }
          }
        }
      }
    `,
  })

  it("renders nothing when no artworks", () => {
    const { toJSON } = renderWithRelay({
      HomeViewComponent: () => ({
        title: "New Works for You",
      }),
      ArtworkConnection: () => ({
        totalCount: 0,
        edges: [],
      }),
    })

    expect(toJSON()).toBeNull()
  })

  it("renders a list of artworks", () => {
    renderWithRelay({
      ArtworksRailHomeViewSection: () => ({
        internalID: "home-view-section-new-works-for-you",
        component: {
          title: "New Works for You",
        },
        artworksConnection: {
          edges: [
            {
              node: {
                internalID: "artwork-1-id",
                slug: "artwork-1-slug",
                title: "Artwork 1",
                href: "/artwork-1-href",
              },
            },
            {
              node: {
                internalID: "artwork-2-id",
                slug: "artwork-2-slug",
                title: "Artwork 2",
                href: "/artwork-2-href",
              },
            },
          ],
        },
      }),
    })

    expect(screen.getByText("New Works for You")).toBeOnTheScreen()
    expect(screen.getByText(/Artwork 1/)).toBeOnTheScreen()
    expect(screen.getByText(/Artwork 2/)).toBeOnTheScreen()

    fireEvent.press(screen.getByText(/Artwork 2/))

    expect(mockTrackEvent.mock.calls[0]).toMatchInlineSnapshot(`
        [
          {
            "action": "tappedArtworkGroup",
            "context_module": "home-view-section-new-works-for-you",
            "context_screen_owner_type": "home",
            "destination_screen_owner_id": "artwork-2-id",
            "destination_screen_owner_slug": "artwork-2-slug",
            "destination_screen_owner_type": "artwork",
            "horizontal_slide_position": 1,
            "module_height": "single",
            "type": "thumbnail",
          },
        ]
      `)

    expect(navigate).toHaveBeenCalledWith("/artwork-2-href")
  })
})
