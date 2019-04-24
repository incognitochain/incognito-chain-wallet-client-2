import React from "react";
import { PopoverMenu } from "./PopoverMenu";
import styled from "styled-components";

export function OptionMenu({ items }) {
  return (
    <Button>
      <PopoverMenu
        renderItems={closeMenu => {
          const { MenuItem } = PopoverMenu;
          return (
            items &&
            items.map(item => {
              const onClick = () => {
                item.onclick();
                closeMenu();
              };
              return (
                <MenuItem key={item.key} onClick={onClick}>
                  {item.text}
                </MenuItem>
              );
            })
          );
        }}
      />
    </Button>
  );
}

const Button = styled.div`
  display: flex;
  flex-direction: column;
`;
