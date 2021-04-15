import { FilterParamName } from "lib/Components/ArtworkFilter/ArtworkFilterHelpers"
import {
  ArtworkFiltersState,
  ArtworkFiltersStoreProvider,
  useSelectedOptionsDisplay,
} from "lib/Components/ArtworkFilter/ArtworkFilterStore"
import { extractText } from "lib/tests/extractText"
import { flushPromiseQueue } from "lib/tests/flushPromiseQueue"
import { renderWithWrappers } from "lib/tests/renderWithWrappers"
import React from "react"
import { Text, TouchableHighlight, TouchableWithoutFeedback, View } from "react-native"
import { useMultiSelect } from "../useMultiSelect"
import { getEssentialProps } from "./helper"

describe("useMultiSelect", () => {
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

  const OPTIONS = [
    { paramName: FilterParamName.colors, paramValue: "example-1", displayText: "Example 1" },
    { paramName: FilterParamName.colors, paramValue: "example-2", displayText: "Example 2" },
    { paramName: FilterParamName.colors, paramValue: "example-3", displayText: "Example 3" },
  ]

  const MockScreen: React.FC = () => {
    const { handleSelect, nextParamValues, isSelected, handleClear } = useMultiSelect({
      options: OPTIONS,
      paramName: FilterParamName.colors,
    })

    const selectedOptions = useSelectedOptionsDisplay()

    return (
      <View>
        <TouchableHighlight onPress={handleClear}>
          <Text>Clear</Text>
        </TouchableHighlight>

        {OPTIONS.map((option) => (
          <TouchableWithoutFeedback
            key={option.paramValue}
            onPress={() => {
              handleSelect(option, !isSelected(option))
            }}
          >
            <Text>{option.displayText}</Text>
          </TouchableWithoutFeedback>
        ))}

        <Text testID="nextParamValues">{JSON.stringify(nextParamValues)}</Text>
        <Text testID="selectedOptions">{JSON.stringify(selectedOptions)}</Text>
      </View>
    )
  }

  const MockComponent = ({ initialData = initialState }: { initialData?: ArtworkFiltersState }) => {
    return (
      <ArtworkFiltersStoreProvider initialData={initialData}>
        <MockScreen {...getEssentialProps()} />
      </ArtworkFiltersStoreProvider>
    )
  }

  it("manages the nextParamValues", () => {
    const tree = renderWithWrappers(<MockComponent initialData={initialState} />)

    expect(extractText(tree.root.findByProps({ testID: "nextParamValues" }))).toEqual("[]")

    const buttons = tree.root.findAllByType(TouchableWithoutFeedback)

    buttons[0].props.onPress()

    expect(extractText(tree.root.findByProps({ testID: "nextParamValues" }))).toEqual('["example-1"]')

    buttons[2].props.onPress()

    expect(extractText(tree.root.findByProps({ testID: "nextParamValues" }))).toEqual('["example-1","example-3"]')

    buttons[0].props.onPress()

    expect(extractText(tree.root.findByProps({ testID: "nextParamValues" }))).toEqual('["example-3"]')
  })

  it("dispatches filter updates", async () => {
    const tree = renderWithWrappers(<MockComponent initialData={initialState} />)
    const buttons = tree.root.findAllByType(TouchableWithoutFeedback)

    buttons[0].props.onPress()
    await flushPromiseQueue()

    expect(extractText(tree.root.findByProps({ testID: "selectedOptions" }))).toContain(
      '{"paramName":"colors","displayText":"Example 1","paramValue":["example-1"]}'
    )

    buttons[2].props.onPress()
    await flushPromiseQueue()

    expect(extractText(tree.root.findByProps({ testID: "selectedOptions" }))).toContain(
      '{"paramName":"colors","displayText":"Example 1, Example 3","paramValue":["example-1","example-3"]}'
    )

    buttons[1].props.onPress()
    await flushPromiseQueue()

    expect(extractText(tree.root.findByProps({ testID: "selectedOptions" }))).toContain(
      '{"paramName":"colors","displayText":"Example 1, Example 3, Example 2","paramValue":["example-1","example-3","example-2"]}'
    )
  })

  it("resets the state when cleared", async () => {
    const tree = renderWithWrappers(<MockComponent initialData={initialState} />)
    const buttons = tree.root.findAllByType(TouchableWithoutFeedback)
    const clear = tree.root.findByType(TouchableHighlight)

    buttons[0].props.onPress()
    await flushPromiseQueue()

    expect(extractText(tree.root.findByProps({ testID: "selectedOptions" }))).toContain(
      '{"paramName":"colors","displayText":"Example 1","paramValue":["example-1"]}'
    )

    clear.props.onPress()
    await flushPromiseQueue()

    expect(extractText(tree.root.findByProps({ testID: "selectedOptions" }))).toContain(
      '{"paramName":"colors","displayText":"All","paramValue":[]}'
    )
  })
})
