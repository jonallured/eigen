import { Flex, Text } from "@artsy/palette-mobile"
import { navigate } from "app/system/navigation/navigate"
import { isPad } from "app/utils/hardware"
import { Button } from "palette"
import { Image } from "react-native"
import { useScreenDimensions } from "shared/hooks"

export const FAQSWA: React.FC = () => {
  const supportUrl = "https://support.artsy.net/hc/en-us/categories/360003689533-Sell"
  const isTablet = isPad()
  const { width: deviceWidth } = useScreenDimensions()
  return (
    <Flex
      pt={4}
      backgroundColor="black100"
      flexDirection={isTablet ? "row" : "column"}
      maxWidth={deviceWidth}
    >
      <Flex mx={2}>
        <Text variant="md" mb={4} color="white100">
          No upfront fees, clear pricing estimates and commission structures.
        </Text>
        <Text variant="xs" color="white100" mb={2}>
          Have more questions?
        </Text>
        <Button
          block={!isTablet}
          minWidth={isTablet ? "50%" : undefined}
          onPress={() => {
            navigate(supportUrl)
          }}
          variant="outlineLight"
          mb={2}
        >
          Read FAQs
        </Button>
      </Flex>
      <Image
        source={require("images/swa-faq-image.png")}
        style={{ width: isTablet ? "40%" : "100%", height: 200 }}
        resizeMode="cover"
      />
    </Flex>
  )
}