import React from "react";
import PropTypes from "prop-types";
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterIcon,
  TwitterShareButton
} from "react-share";
import { Wrapper, Title, Content } from "./styled";

const SocialShare = ({ url, quote }) => (
  <Wrapper>
    <Title>Invite your friends to explore Incognito.</Title>
    <Content>
      <FacebookShareButton url={url} quote={quote}>
        <FacebookIcon />
      </FacebookShareButton>
      <TwitterShareButton url={url} title={quote}>
        <TwitterIcon />
      </TwitterShareButton>
    </Content>
  </Wrapper>
);

SocialShare.defaultProps = {
  url: "https://www.myconstant.com/"
};

export default SocialShare;
