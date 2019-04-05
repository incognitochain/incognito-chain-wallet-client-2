import React from "react";
import styled, { keyframes } from "styled-components";

const stroke = keyframes`{
  to {
    stroke-dashoffset: 0;
  }
}`;

const fadeIn = keyframes`{
	to {
		opacity: 1;
	}
}`;

const flash = keyframes`{
	0% {
		opacity: 1;
		transform: translate(-50%,-50%) scale(1);
	}
	
	40% {
		opacity: 0.5;
		transform: translate(-50%,-50%) scale(0.9);
	}
	
	100% {
		opacity: 1;
		transform: translate(-50%,-50%) scale(1);
	}
}`;

const color = keyframes`{
	0% {
		stroke: #2d4cf5;
	}
	
	50% {
		stroke: #81d3ea;
	}
	
	100% {
		stroke: #2d4cf5;
	}
}`;

const status = keyframes`{
	0% {
    opacity: 1;
    color: black;
    content: 'Initializing...';
	}
	
	30% {
    opacity: 1;
    color: green;
		content: 'Loading your wallet...';
	}
	
	100% {
    opacity: 1;
    color: #2d4cf5;
    font-weight: bold;
		content: 'Almost done, please patient...';
	}
}`;

const Container = styled.div`
  position: relative;
  background-color: transparent;
  width: 100%;
  height: 500px;
`;

const SVG = styled.svg`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const Round = styled.svg`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140px;
  height: 140px;
  background-color: #2d4cf5;
  border-radius: 100px;
  opacity: 0;
  transform-origin: 50% 50%;
  animation: ${fadeIn} 0.75s linear 1s forwards, ${flash} 2s linear 2s infinite;
`;

const Circle = styled.circle`
  fill-opacity: 0;
  stroke-dasharray: 450;
  stroke-dashoffset: 450;
  stroke-width: 10;
  stroke: #2d4cf5;
  animation: ${stroke} 1s ease-out forwards, ${color} 2s linear 2s infinite;
`;

const TextContainer = styled.div`
  position: absolute;
  bottom: 10px;
  display: block;
  text-align: center;
  padding: 10px;
  font-weight: bold;
  width: 100%;
  font-size: 25px;
`;

const Title = styled.div`
  display: block;
  text-align: center;
  font-weight: bold;
  width: 100%;
  font-size: 25px;
`;

const StatusText = styled.div`
  display: block;
  text-align: center;
  font-weight: 400;
  width: 100%;
  font-size: 16px;

  &::after {
    opacity: 0;
    content: "";
    animation: ${status} 22s linear 2s forwards;
  }
`;

const SplashScreen = () => {
  return (
    <Container>
      <SVG height="200" width="200">
        <Circle cx="100" cy="100" r="95" transform="rotate(45 100 100)" />
      </SVG>
      <Round />
      <TextContainer>
        <StatusText />
        <Title>Constant Wallet</Title>
      </TextContainer>
    </Container>
  );
};

export default SplashScreen;
