import { Box, Spacer, Text, Touchable } from "palette"
import ReactAppboy from "react-native-appboy-sdk"
import OpaqueImageView from "app/Components/OpaqueImageView/OpaqueImageView"
import { navigate } from "app/navigation/navigate"
import { useScreenDimensions } from "shared/hooks"
import { FlatList } from "react-native"
import React, { useCallback, useEffect, useState } from "react"

interface CardProps {
  item: ReactAppboy.CaptionedContentCard
}

const Card: React.FC<CardProps> = ({ item }) => {
  const { width: screenWidth } = useScreenDimensions()
  const height = 500
  const width = screenWidth - 80
  const handlePress = () => {
    ReactAppboy.logContentCardClicked(item.id)
    item.url && navigate(item.url)
  }

  return (
    <Touchable key={item.id} onPress={handlePress}>
      <Box bg="black5" height={height} mx={2} p={2}>
        <OpaqueImageView aspectRatio={item.imageAspectRatio} imageURL={item.image} width={width} />
        <Spacer mb={2} />
        <Box width={width}>
          <Text pb={1} variant="lg">
            {item.title}
          </Text>
          <Text color="black60" pb={2}>
            {item.cardDescription}
          </Text>
          <Text>{item.domain}</Text>
        </Box>
      </Box>
    </Touchable>
  )
}

export const Cards: React.FC = () => {
  const [cards, setCards] = useState([] as ReactAppboy.CaptionedContentCard[])
  const [viewedCards, setViewedCards] = useState([] as ReactAppboy.CaptionedContentCard[])

  useEffect(() => {
    const listener = ReactAppboy.addListener(ReactAppboy.Events.CONTENT_CARDS_UPDATED, async () => {
      const updatedCards = await ReactAppboy.getContentCards()
      setCards(updatedCards as ReactAppboy.CaptionedContentCard[])
    })

    ReactAppboy.requestContentCardsRefresh()

    return () => {
      listener.remove()
    }
  }, [])

  const handleViewableItemsChanged = useCallback((viewable) => {
    const changed = viewable.changed as ReactAppboy.CaptionedContentCard[]
    const filteredCards = changed.filter((card) => !viewedCards.includes(card))
    if (filteredCards.length === 0) return

    filteredCards.forEach((card) => ReactAppboy.logContentCardImpression(card.id))
    setViewedCards([...viewedCards, ...filteredCards])
  }, [])

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
    </>
  )
}
