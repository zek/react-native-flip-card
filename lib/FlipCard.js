import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { View, TouchableWithoutFeedback, Animated } from 'react-native';

export default class FlipCard extends PureComponent {
  static propTypes = {
    backSide: PropTypes.node.isRequired,
    clickable: PropTypes.bool,
    flipHorizontal: PropTypes.bool,
    flipVertical: PropTypes.bool,
    frontSide: PropTypes.node.isRequired,
    initialFlip: PropTypes.bool,
    onFlipEnd: PropTypes.func,
    onFlipStart: PropTypes.func,
    perspective: PropTypes.number,
    useNativeDriver: PropTypes.bool
  };

  static defaultProps = {
    clickable: true,
    flipHorizontal: false,
    flipVertical: true,
    initialFlip: false,
    onFlipEnd: () => {},
    onFlipStart: () => {},
    perspective: 1000,
    useNativeDriver: true
  };

  state = {
    isFlipped: this.props.initialFlip,
  };

  isFlipping = false;

  rotate = new Animated.Value(Number(this.props.initialFlip));

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  toggleCard = () => {
    const { isFlipped } = this.state;
    this.animate(!isFlipped);
  };

  animate(toValue) {
    if (this.isFlipping) return;

    const { isFlipped } = this.state;
    const { onFlipStart, onFlipEnd, friction, useNativeDriver } = this.props;
    this.isFlipping = true;
    onFlipStart(isFlipped);

    this.timer = setTimeout(() => {
      this.isFlipping = false;
      this.setState({ isFlipped: toValue });
      onFlipEnd(toValue);
      this.timer = null;
    }, 120);

    Animated.spring(this.rotate,
      {
        toValue: Number(toValue),
        friction,
        useNativeDriver
      }
    ).start();
  }

  getTransforms() {
    const { perspective, flipHorizontal } = this.props;
    const { isFlipped } = this.state;
    return ([
      { perspective },
      {
        [flipHorizontal ? 'rotateY' : 'rotateX']: this.rotate.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg']
        })
      },
      isFlipped && {
        [flipHorizontal ? 'scaleX' : 'scaleY']: -1
      }
    ]).filter(Boolean);
  }

  render() {
    const { clickable, style, backSide, frontSide, ...rest } = this.props;
    const { isFlipped } = this.state;

    const Wrapper = clickable ? TouchableWithoutFeedback : View;

    return (
      <Wrapper onPress={this.toggleCard}>
        <Animated.View
          style={[{ transform: this.getTransforms() }, style]}
          {...rest}
        >
          {isFlipped ? backSide : frontSide}
        </Animated.View>
      </Wrapper>
    );
  }
}
