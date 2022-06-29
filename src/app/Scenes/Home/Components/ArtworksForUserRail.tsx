import { ArtworksForUserRail_artworksForUser$data } from "__generated__/ArtworksForUserRail_artworksForUser.graphql"
import React, { useImperativeHandle, useRef } from "react"
import { ActionType, ContextModule, OwnerType } from "@artsy/cohesion"
import { Flex } from "palette"
import { FlatList, View } from "react-native"
import { SectionTitle } from "app/Components/SectionTitle"
import { navigate } from "app/navigation/navigate"
import { useTracking } from "react-tracking"
import { SmallArtworkRail } from "app/Components/ArtworkRail/SmallArtworkRail"
import { extractNodes } from "app/utils/extractNodes"
import HomeAnalytics from "../homeAnalytics"
import { createFragmentContainer, graphql } from "react-relay"
import { RailScrollProps } from "./types"

const tracks = {
  tappedHeader: () => ({
    action: ActionType.tappedArtworkGroup,
    context_module: ContextModule.newWorksForYouRail,
    context_screen_owner_type: OwnerType.home,
    destination_screen_owner_type: OwnerType.newWorksForYou,
    type: "header",
  }),
}

interface ArtworksForUserRailProps {
  title: string
  artworksForUser: ArtworksForUserRail_artworksForUser$data
  mb?: number
}

export const ArtworksForUserRail: React.FC<ArtworksForUserRailProps & RailScrollProps> = ({
  title,
  artworksForUser,
  scrollRef,
  mb,
}) => {
  const artworks = extractNodes(artworksForUser)

  if (!artworks.length) {
    return null
  }

  const railRef = useRef<View>(null)
  const listRef = useRef<FlatList<any>>(null)

  useImperativeHandle(scrollRef, () => ({
    scrollToTop: () => listRef.current?.scrollToOffset({ offset: 0, animated: false }),
  }))

  const { trackEvent } = useTracking()

  return (
    <Flex mb={mb}>
      <View ref={railRef}>
        <Flex pl="2" pr="2">
          <SectionTitle
            title={title}
            onPress={() => {
              trackEvent(tracks.tappedHeader())
              navigate(`/new-works-for-you`)
            }}
          />
        </Flex>
        <SmallArtworkRail
          artworks={artworks}
          onPress={(artwork, position) => {
            trackEvent(
              HomeAnalytics.artworkThumbnailTapEvent(
                ContextModule.newWorksForYouRail,
                artwork.slug,
                position,
                "single"
              )
            )
            navigate(artwork.href!)
          }}
        />
      </View>
    </Flex>
  )
}

export const ArtworksForUserRailFragmentContainer = createFragmentContainer(ArtworksForUserRail, {
  artworksForUser: graphql`
    fragment ArtworksForUserRail_artworksForUser on ArtworkConnection {
      edges {
        node {
          ...SmallArtworkRail_artworks
        }
      }
    }
  `,
})
