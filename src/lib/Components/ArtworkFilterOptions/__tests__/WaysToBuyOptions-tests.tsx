import { OptionListItem as FilterModalOptionListItem } from "lib/Components/ArtworkFilter"
import { MockFilterScreen } from "lib/Components/ArtworkFilter/__tests__/FilterTestHelper"
import { ArtworkFiltersState, ArtworkFiltersStoreProvider } from "lib/Components/ArtworkFilter/ArtworkFiltersStore"
import { FilterParamName } from "lib/Components/ArtworkFilter/FilterArtworksHelpers"
import { extractText } from "lib/tests/extractText"
import { renderWithWrappers } from "lib/tests/renderWithWrappers"
import React from "react"
import { Switch } from "react-native"
import { OptionListItem } from "../MultiSelectOption"
import { WaysToBuyOptionsScreen } from "../WaysToBuyOptions"
import { getEssentialProps } from "./helper"

describe("Ways to Buy Options Screen", () => {
  const initialState: ArtworkFiltersState = {
    selectedFilters: [],
    appliedFilters: [],
    previouslyAppliedFilters: [],
    applyFilters: false,
    aggregations: [],
    filterType: "artwork",
    counts: {
      total: null,
      followedArtists: null,
    },
  }

  const MockWaysToBuyScreen = ({ initialData = initialState }: { initialData?: ArtworkFiltersState }) => (
    <ArtworkFiltersStoreProvider initialData={initialData}>
      <WaysToBuyOptionsScreen {...getEssentialProps()} />
    </ArtworkFiltersStoreProvider>
  )

  it("renders the correct ways to buy options", () => {
    const tree = renderWithWrappers(<MockWaysToBuyScreen initialData={initialState} />)

    expect(tree.root.findAllByType(OptionListItem)).toHaveLength(4)

    const listItems = tree.root.findAllByType(OptionListItem)
    const firstListItem = listItems[0]
    expect(extractText(firstListItem)).toBe("Buy now")

    const secondListItem = listItems[1]
    expect(extractText(secondListItem)).toBe("Make offer")

    const thirdListItem = listItems[2]
    expect(extractText(thirdListItem)).toBe("Bid")

    const fourthListItem = listItems[3]
    expect(extractText(fourthListItem)).toBe("Inquire")
  })

  it("displays the default text when no filter selected on the filter modal screen", () => {
    const injectedState: ArtworkFiltersState = {
      selectedFilters: [],
      appliedFilters: [],
      previouslyAppliedFilters: [],
      applyFilters: false,
      aggregations: [],
      filterType: "artwork",
      counts: {
        total: null,
        followedArtists: null,
      },
    }

    const tree = renderWithWrappers(<MockFilterScreen initialState={injectedState} />)

    const waysToBuyListItem = tree.root.findAllByType(FilterModalOptionListItem)[1]

    expect(extractText(waysToBuyListItem)).toContain("All")
  })

  it("displays all the selected filters on the filter modal screen", () => {
    const injectedState: ArtworkFiltersState = {
      selectedFilters: [
        {
          displayText: "Buy now",
          paramName: FilterParamName.waysToBuyBuy,
          paramValue: true,
        },
        {
          displayText: "Inquire",
          paramName: FilterParamName.waysToBuyInquire,
          paramValue: true,
        },
        {
          displayText: "Bid",
          paramName: FilterParamName.waysToBuyBid,
          paramValue: true,
        },
      ],
      appliedFilters: [],
      previouslyAppliedFilters: [],
      applyFilters: false,
      aggregations: [],
      filterType: "artwork",
      counts: {
        total: null,
        followedArtists: null,
      },
    }

    const tree = renderWithWrappers(<MockFilterScreen initialState={injectedState} />)

    expect(extractText(tree.root)).toContain("Buy now, Inquire, Bid")
  })

  it("toggles selected filters 'ON' and unselected filters 'OFF", () => {
    const injectedState: ArtworkFiltersState = {
      selectedFilters: [
        {
          displayText: "Buy now",
          paramName: FilterParamName.waysToBuyBuy,
          paramValue: true,
        },
      ],
      appliedFilters: [],
      previouslyAppliedFilters: [],
      applyFilters: false,
      aggregations: [],
      filterType: "artwork",
      counts: {
        total: null,
        followedArtists: null,
      },
    }

    const tree = renderWithWrappers(<MockWaysToBuyScreen initialData={injectedState} />)
    const switches = tree.root.findAllByType(Switch)

    expect(switches[0].props.value).toBe(true)

    expect(switches[1].props.value).toBe(false)

    expect(switches[2].props.value).toBe(false)

    expect(switches[3].props.value).toBe(false)
  })

  it("it toggles applied filters 'ON' and unapplied filters 'OFF", () => {
    const injectedState: ArtworkFiltersState = {
      selectedFilters: [],
      appliedFilters: [
        {
          displayText: "Inquire",
          paramName: FilterParamName.waysToBuyInquire,
          paramValue: true,
        },
      ],
      previouslyAppliedFilters: [
        {
          displayText: "Inquire",
          paramName: FilterParamName.waysToBuyInquire,
          paramValue: true,
        },
      ],
      applyFilters: false,
      aggregations: [],
      filterType: "artwork",
      counts: {
        total: null,
        followedArtists: null,
      },
    }

    const tree = renderWithWrappers(<MockWaysToBuyScreen initialData={injectedState} />)
    const switches = tree.root.findAllByType(Switch)

    expect(switches[0].props.value).toBe(false)

    expect(switches[1].props.value).toBe(false)

    expect(switches[2].props.value).toBe(false)

    expect(switches[3].props.value).toBe(true)
  })
})
