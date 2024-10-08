import { fireEvent, screen } from "@testing-library/react-native"
import { ArticlesRailHomeViewSectionTestsQuery } from "__generated__/ArticlesRailHomeViewSectionTestsQuery.graphql"
import { ArticlesRailHomeViewSection } from "app/Scenes/HomeView/Sections/ArticlesRailHomeViewSection"
import { mockTrackEvent } from "app/utils/tests/globallyMockedStuff"
import { setupTestWrapper } from "app/utils/tests/setupTestWrapper"
import { graphql } from "react-relay"

describe("ArticlesRailHomeViewSection", () => {
  const { renderWithRelay } = setupTestWrapper<ArticlesRailHomeViewSectionTestsQuery>({
    Component: (props) => {
      if (!props.homeView.section) {
        return null
      }
      return <ArticlesRailHomeViewSection section={props.homeView.section} />
    },
    query: graphql`
      query ArticlesRailHomeViewSectionTestsQuery @relay_test_operation {
        homeView {
          section(id: "home-view-section-articles-rail") {
            ... on ArticlesRailHomeViewSection {
              ...ArticlesRailHomeViewSection_section
            }
          }
        }
      }
    `,
  })

  it("renders a list of articles", () => {
    renderWithRelay({
      ArticlesRailHomeViewSection: () => ({
        internalID: "home-view-section-latest-articles",
        component: {
          title: "Latest Articles",
        },
        articlesConnection: {
          edges: [
            {
              node: {
                thumbnailTitle: "Article 1",
                slug: "article-1",
                internalID: "article-1-id",
              },
            },
            {
              node: {
                thumbnailTitle: "Article 2",
                slug: "article-2",
                internalID: "article-2-id",
              },
            },
          ],
        },
      }),
    })

    expect(screen.getByText("Latest Articles")).toBeOnTheScreen()
    expect(screen.getByText("Article 1")).toBeOnTheScreen()
    expect(screen.getByText("Article 2")).toBeOnTheScreen()

    fireEvent.press(screen.getByText("Article 2"))
    expect(mockTrackEvent.mock.calls[0]).toMatchInlineSnapshot(`
        [
          {
            "action": "tappedArticleGroup",
            "context_module": "home-view-section-latest-articles",
            "context_screen_owner_id": undefined,
            "context_screen_owner_slug": undefined,
            "context_screen_owner_type": "home",
            "destination_screen_owner_id": "article-2-id",
            "destination_screen_owner_slug": "article-2",
            "destination_screen_owner_type": "article",
            "horizontal_slide_position": 1,
            "module_height": "double",
            "type": "thumbnail",
          },
        ]
      `)
  })
})
