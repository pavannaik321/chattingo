import { ViewIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadgeitem";
import UserListitem from "../UserAvatar/UserListitem";
const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameoading] = useState(false);

  const toast = useToast();

  const { selectedChat, setSelectedChat, user } = ChatState();
  console.log(selectedChat);
  // logic for adding user
  const handleAddUser = async (user1) => {
    console.log("function called");
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toast({
        title: "User Already in group!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Only admins can add someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        "api/chat/groupadd",
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );
      toast({
        title: `${user1.name} added to group`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setSearchResult([]);
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setSearchResult([]);
      setLoading(false);
    }
  };

  // removing the user form the chat

  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toast({
        title: "Only admins can add someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        const { data } = await axios.put(
          "api/chat/groupremove",
          {
            chatId: selectedChat._id,
            userId: user1._id,
          },
          config
        );
        toast({
          title: `${user1.name} removed from group`,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setSearchResult([]);
        user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
        setFetchAgain(!fetchAgain);
        setLoading(false);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: error.response.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setSearchResult([]);
        setLoading(false);
      }
    } else {
      toast({
        title: "User dosent exist in group!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
  };

  // rename the user

  const handleRename = async () => {
    if (!groupChatName) {
      console.log("select all fields");
      return;
    }

    try {
      setRenameoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      console.log(selectedChat._id);
      const { data } = await axios.put(
        "/api/chat/rename",
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );
      toast({
        title: "Successfully renames",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameoading(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to rename",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setRenameoading(false);
    }
    setGroupChatName("");
  };

  //search user

  const handleSearch = async (query) => {
    console.log(search);
    if (!query.target.value) {
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
      console.log(search);
      console.log(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Result",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <>
      <IconButton
        display={{ base: "flex" }}
        icon={<ViewIcon />}
        onClick={onOpen}
      />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize={"35px"}
            fontFamily={"Work sans"}
            fontWeight={"medium"}
            display={"flex"}
            justifyContent={"center"}
          >
            {selectedChat.chatName}{" "}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box
              w={"100%"}
              display={"flex"}
              flexDirection={"row"}
              flexWrap={"wrap"}
              pb={3}
            >
              {selectedChat.users.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleRemove(u)}
                />
              ))}
            </Box>
            <FormControl display={"flex"}>
              <Input
                placeholder="Chat Name"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant={"solid"}
                colorScheme="teal"
                ml={1}
                isLoading={renameloading}
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>
            {/* for adding users */}
            <FormControl display={"flex"}>
              <Input
                placeholder="Add User to group"
                mb={1}
                onChange={(e) => {
                  handleSearch(e);
                  setSearch(e.target.value);
                  console.log(e.target.value);
                }}
              />
            </FormControl>
            {loading ? (
              <Spinner size={"lg"} />
            ) : (
              searchResult.map((user) => (
                <UserListitem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddUser(user)}
                />
              ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="red"
              /* onClick={onClose} */ onClick={() => handleRemove(user)}
            >
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
