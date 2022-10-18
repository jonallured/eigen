import { Box, Button, Flex, Spacer, Text, Touchable } from "palette"
import ReactAppboy from "react-native-appboy-sdk"
import OpaqueImageView from "app/Components/OpaqueImageView/OpaqueImageView"
import { navigate } from "app/navigation/navigate"
import { useScreenDimensions } from "shared/hooks"
import { Animated, FlatList } from "react-native"
import React, { useCallback, useEffect, useState } from "react"

interface CardProps {
  item: ReactAppboy.CaptionedContentCard
}

const Card: React.FC<CardProps> = ({ item }) => {
  const { width: screenWidth } = useScreenDimensions()
  const height = 250
  const imageWidth = 125
  const handlePress = () => {
    ReactAppboy.logContentCardClicked(item.id)
    item.url && navigate(item.url)
  }

  return (
    <Touchable key={item.id} onPress={handlePress}>
      <Flex bg="black100" flexDirection="row" height={height} width={screenWidth}>
        <OpaqueImageView
          height={height}
          imageURL={item.image}
          resizeMode="cover"
          width={imageWidth}
        />
        <Box p={2} width={screenWidth - imageWidth}>
          <Text color="white100" mb={1} numberOfLines={2} variant="lg-display">
            {item.title}
          </Text>
          <Text color="white100" mb={2} numberOfLines={3}>
            {item.cardDescription}
          </Text>
          <Button size="small" variant="outlineLight" onPress={handlePress}>
            {item.domain}
          </Button>
        </Box>
      </Flex>
    </Touchable>
  )
}

export const Cards: React.FC = () => {
  const [cards, setCards] = useState([] as ReactAppboy.CaptionedContentCard[])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [viewedCards, setViewedCards] = useState([] as ReactAppboy.CaptionedContentCard[])

  useEffect(() => {
    const eventName = ReactAppboy.Events.CONTENT_CARDS_UPDATED
    const callback = async () => {
      const updatedCards = await ReactAppboy.getContentCards()
      const sortedCards = updatedCards.sort((lhs, rhs) =>
        lhs.extras.position > rhs.extras.position ? 1 : -1
      )
      setCards(sortedCards as ReactAppboy.CaptionedContentCard[])
    }

    const listener = ReactAppboy.addListener(eventName, callback)
    ReactAppboy.requestContentCardsRefresh()

    return () => {
      listener.remove()
    }
  }, [])

  const handleViewableItemsChanged = useCallback(
    (viewable) => {
      const viewableCards = viewable.viewableItems.map(
        (viewableItem: any) => viewableItem.item
      ) as ReactAppboy.CaptionedContentCard[]
      const lastShown = viewableCards[viewableCards.length - 1]
      const newCardIndex = cards.findIndex((card) => card.id === lastShown.id)
      setCurrentCardIndex(newCardIndex)
      const filteredCards = viewableCards.filter((card) => !viewedCards.includes(card))
      if (filteredCards.length === 0) return

      filteredCards.forEach((card) => ReactAppboy.logContentCardImpression(card.id))
      setViewedCards([...viewedCards, ...filteredCards])
    },
    [cards]
  )

  const { width } = useScreenDimensions()

  if (cards.length < 1) return null

  return (
    <>
      <FlatList
        data={cards}
        decelerationRate="fast"
        horizontal
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={handleViewableItemsChanged}
        renderItem={({ item }) => <Card item={item} />}
        snapToAlignment="start"
        snapToInterval={width}
        viewabilityConfig={{ itemVisiblePercentThreshold: 25 }}
      />
      <Spacer mb={2} />
      <PaginationDots currentIndex={currentCardIndex} length={cards.length} />
      <Spacer mb={2} />
    </>
  )
}

export interface PaginationDotsProps {
  currentIndex: number
  length: number
}

export const PaginationDots: React.FC<PaginationDotsProps> = (props) => {
  const { currentIndex, length } = props

  return (
    <Flex flexDirection="row" justifyContent="center">
      {Array.from(Array(length)).map((_, index) => (
        <PaginationDot active={currentIndex === index} key={index} />
      ))}
    </Flex>
  )
}

export interface PaginationDotProps {
  active: boolean
}

export const PaginationDot: React.FC<PaginationDotProps> = (props) => {
  const { active } = props
  const opacity = active ? 1 : 0.1
  const diameter = 5

  return (
    <Animated.View
      accessibilityLabel="Image Pagination Indicator"
      style={{
        backgroundColor: "black",
        borderRadius: diameter / 2,
        height: diameter,
        marginHorizontal: diameter * 0.8,
        opacity,
        width: diameter,
      }}
    />
  )
}
