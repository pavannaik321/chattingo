import { CloseIcon } from "@chakra-ui/icons";
import { Box } from "@chakra-ui/react";
import React from "react";

const UserBadgeitem = ({ user, handleFunction }) => {
  const loguser = JSON.parse(localStorage.getItem("userLoginInfo"));

  console.log(loguser._id);
  return (
    <>
      {user._id === loguser._id ? (
        <Box
          px={2}
          py={1}
          borderRadius={"lg"}
          m={1}
          mb={2}
          variant="solid"
          fontSize={12}
          backgroundColor="green"
          cursor={"pointer"}
          onClick={handleFunction}
          color={"white"}
        >
          {user.name}
          <CloseIcon pl={1} />
        </Box>
      ) : (
        <Box
          px={2}
          py={1}
          borderRadius={"lg"}
          m={1}
          mb={2}
          variant="solid"
          fontSize={12}
          backgroundColor="purple"
          cursor={"pointer"}
          onClick={handleFunction}
          color={"white"}
        >
          {user.name}
          <CloseIcon pl={1} />
        </Box>
      )}
    </>
  );
};

export default UserBadgeitem;
