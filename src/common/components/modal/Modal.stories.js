import React from "react";

import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { linkTo } from "@storybook/addon-links";

import Modal from "./Modal";

storiesOf("Modal", module).add("with text", () => {
  const WithText = () => {
    const [isOpen, setIsOpen] = React.useState();

    return (
      <div>
        <button onClick={() => setIsOpen(true)}>Open Modal</button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          Modal Content
        </Modal>
      </div>
    );
  };

  return <WithText />;
});
