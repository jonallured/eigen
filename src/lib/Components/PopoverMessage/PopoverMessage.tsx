import { useScreenDimensions } from "lib/utils/useScreenDimensions"
import { Box, CloseIcon, Color, color, Flex, Text, Touchable } from "palette"
import React, { useEffect, useRef, useState } from "react"
import { Animated, Platform } from "react-native"
import useTimeoutFn from "react-use/lib/useTimeoutFn"
import { usePopoverMessage } from "./popoverMessageHooks"

export const AnimatedFlex = Animated.createAnimatedComponent(Flex)

const EDGE_POPOVER_MESSAGE_HEIGHT = Platform.OS === "ios" ? 80 : 90
const EDGE_POPOVER_MESSAGE_PADDING = 10
const FRICTION = 20
const NAVBAR_HEIGHT = 44

export type PopoverMessagePlacement = "top" | "bottom"
export type PopoverMessageType = "info" | "success" | "error" | "default"
export type PopoverMessageOptions = Omit<PopoverMessageProps, "id" | "positionIndex">

export const getTitleColorByType = (type?: PopoverMessageType): Color => {
  if (type === "success") {
    return "green100"
  } else if (type === "info") {
    return "blue100"
  } else if (type === "error") {
    return "red100"
  }

  return "black100"
}

export interface PopoverMessageProps {
  id: string
  positionIndex: number
  placement: PopoverMessagePlacement
  title: string
  message?: string
  autoHide?: boolean
  hideTimeout?: number
  showCloseIcon?: boolean
  type?: PopoverMessageType
  onPress?: () => void
  onClose?: () => void
}

// TODO: Remove NAVBAR_HEIGHT when a new design without a floating back button is added
export const PopoverMessage: React.FC<PopoverMessageProps> = (props) => {
  const {
    id,
    positionIndex,
    placement,
    title,
    message,
    autoHide = true,
    hideTimeout = 3500,
    showCloseIcon = true,
    type,
    onPress,
    onClose,
  } = props
  const { safeAreaInsets } = useScreenDimensions()
  const { hide } = usePopoverMessage()
  const [opacityAnim] = useState(new Animated.Value(0))
  const [translateYAnim] = useState(new Animated.Value(0))
  const isClosed = useRef<boolean>(false)
  const titleColor = getTitleColorByType(type)

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateYAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: FRICTION,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        useNativeDriver: true,
        duration: 450,
      }),
    ]).start()
  }, [])

  const hideAnimation = () => {
    isClosed.current = true
    Animated.parallel([
      Animated.spring(translateYAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: FRICTION,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        useNativeDriver: true,
        duration: 250,
      }),
    ]).start(() => hide(id))
  }

  const handlePopoverMessagePress = () => {
    hideAnimation()
    onPress?.()
  }

  const handlePopoverMessageClosePress = () => {
    hideAnimation()
    onClose?.()
  }

  useTimeoutFn(() => {
    if (autoHide && !isClosed.current) {
      hideAnimation()
    }
  }, hideTimeout)

  const range = [-EDGE_POPOVER_MESSAGE_HEIGHT, 0]
  const outputRange = placement === "top" ? range : range.map((item) => item * -1)
  const translateY = translateYAnim.interpolate({ inputRange: [0, 1], outputRange })
  const opacity = opacityAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] })
  const offset =
    EDGE_POPOVER_MESSAGE_PADDING + positionIndex * (EDGE_POPOVER_MESSAGE_HEIGHT + EDGE_POPOVER_MESSAGE_PADDING)

  const content = (
    <Flex p={1}>
      <Flex flexDirection="row" justifyContent="space-between">
        <Flex flex={1} mr={!!showCloseIcon ? 1 : 0}>
          <Text color={titleColor} variant="subtitle" numberOfLines={1}>
            {title}
          </Text>
          {!!message && (
            <Text numberOfLines={2} color="black60" variant="small">
              {message}
            </Text>
          )}
        </Flex>
        {!!showCloseIcon && (
          <Box mt={0.25}>
            <Touchable onPress={handlePopoverMessageClosePress}>
              <CloseIcon />
            </Touchable>
          </Box>
        )}
      </Flex>
    </Flex>
  )

  return (
    <AnimatedFlex
      position="absolute"
      left="1"
      right="1"
      height={EDGE_POPOVER_MESSAGE_HEIGHT}
      bottom={placement === "bottom" ? safeAreaInsets.bottom + offset : undefined}
      top={placement === "top" ? safeAreaInsets.top + offset + NAVBAR_HEIGHT : undefined}
      style={{
        opacity,
        transform: [{ translateY }],
        zIndex: 99999,
        borderColor: "#F7F7F7",
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 5,
      }}
      backgroundColor={color("white100")}
    >
      {typeof onPress !== "undefined" ? (
        <Touchable noFeedback onPress={handlePopoverMessagePress}>
          {content}
        </Touchable>
      ) : (
        content
      )}
    </AnimatedFlex>
  )
}
