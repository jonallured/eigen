import { fireEvent, screen } from "@testing-library/react-native"
import { FairsRailHomeViewSectionTestsQuery } from "__generated__/FairsRailHomeViewSectionTestsQuery.graphql"
import { FairsRailHomeViewSection } from "app/Scenes/HomeView/Sections/FairsRailHomeViewSection"
import { navigate } from "app/system/navigation/navigate"
import { mockTrackEvent } from "app/utils/tests/globallyMockedStuff"
import { setupTestWrapper } from "app/utils/tests/setupTestWrapper"
import { graphql } from "react-relay"

describe("FairsRailHomeViewSection", () => {
  const { renderWithRelay } = setupTestWrapper<FairsRailHomeViewSectionTestsQuery>({
    Component: (props) => {
      if (!props.homeView.section) {
        return null
      }
      return <FairsRailHomeViewSection section={props.homeView.section} />
    },
    query: graphql`
      query FairsRailHomeViewSectionTestsQuery @relay_test_operation {
        homeView {
          section(id: "home-view-section-latest-auction-results") {
            ... on FairsRailHomeViewSection {
              ...FairsRailHomeViewSection_section
            }
          }
        }
      }
    `,
  })

  it("renders nothing when there are no fairs", () => {
    const { toJSON } = renderWithRelay({
      HomeViewComponent: () => ({
        title: "Fairs for You",
        desriptions: "The most exciting fairs in the world",
      }),
      FairConnection: () => ({
        totalCount: 0,
        edges: [],
      }),
    })

    expect(toJSON()).toBeNull()
  })

  it("renders a list of fairs", () => {
    renderWithRelay({
      HomeViewComponent: () => ({
        title: "Fairs for You",
        description: "The most exciting fairs in the world",
      }),
      FairConnection: () => ({
        edges: [
          {
            node: {
              name: "Fair 1",
            },
          },
          {
            node: {
              name: "Fair 2",
            },
          },
        ],
      }),
    })

    expect(screen.getByText("Fairs for You")).toBeOnTheScreen()
    expect(screen.getByText(/Fair 1/)).toBeOnTheScreen()
    expect(screen.getByText(/Fair 2/)).toBeOnTheScreen()
  })

  it("tracks fairs taps properly", () => {
    renderWithRelay({
      FairsRailHomeViewSection: () => ({
        internalID: "home-view-section-fairs-for-you",
        component: {
          title: "Fairs for You",
          description: "The most exciting fairs in the world",
        },
        fairsConnection: {
          edges: [
            {
              node: {
                internalID: "fair-1-id",
                slug: "fair-1-slug",
                name: "Fair 1",
              },
            },
            {
              node: {
                internalID: "fair-2-id",
                slug: "fair-2-slug",
                name: "Fair 2",
              },
            },
          ],
        },
      }),
    })

    expect(screen.getByText("Fairs for You")).toBeOnTheScreen()
    expect(screen.getByText(/Fair 1/)).toBeOnTheScreen()
    expect(screen.getByText(/Fair 2/)).toBeOnTheScreen()

    fireEvent.press(screen.getByText(/Fair 2/))
    expect(mockTrackEvent.mock.calls[0]).toMatchInlineSnapshot(`
        [
          {
            "action": "tappedFairGroup",
            "context_module": "home-view-section-fairs-for-you",
            "context_screen_owner_id": undefined,
            "context_screen_owner_slug": undefined,
            "context_screen_owner_type": "home",
            "destination_screen_owner_id": "fair-2-id",
            "destination_screen_owner_slug": "fair-2-slug",
            "destination_screen_owner_type": "fair",
            "horizontal_slide_position": 1,
            "module_height": "double",
            "type": "thumbnail",
          },
        ]
      `)

    expect(navigate).toHaveBeenCalledWith("/fair/fair-2-slug")
  })
})
