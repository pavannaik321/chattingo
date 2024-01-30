import React, { useState } from "react";
import UserListitem from "../UserAvatar/UserListitem";
import {
  Avatar,
  Box,
  Button,
  useToast,
  Text,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  FormControl,
  FormLabel,
  Input,
  ModalFooter,
  useDisclosure,
  ModalCloseButton,
} from "@chakra-ui/react";
import { ChatState } from "../../Context/ChatProvider";
import axios from "axios";
import UserBadgeitem from "../UserAvatar/UserBadgeitem";

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setgroupChatName] = useState();
  const [selectedUsers, setselectedUsers] = useState([]);
  const [search, setsearch] = useState();
  const [searchResult, setsearchResult] = useState([]);
  const [loading, setloading] = useState(false);

  const toast = useToast();
  const { user, chats, setChats } = ChatState();

  const handerSearch = async (query) => {
    console.log(search);
    if (!query.target.value) {
      return;
    }

    try {
      setloading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setloading(false);
      setsearchResult(data);
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

  const handelGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toast({
        title: "User already added",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    setselectedUsers([...selectedUsers, userToAdd]);
  };

  const handleDelete = (delUser) => {
    setselectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  const handelSubmit = async () => {
    console.log(groupChatName);
    console.log(selectedUsers);
    if (!groupChatName || !selectedUsers) {
      toast({
        title: "Please fill all the fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (selectedUsers.length < 2) {
      toast({
        title: "Please Select more then 2 users",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        "/api/chat/group",
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );

      setChats([data, ...chats]);
      onClose();
      toast({
        title: "New Group Chat Created",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setselectedUsers([]);
      setsearchResult([]);
    } catch (error) {
      toast({
        title: "failed to create chat!",
        status: error.response.data,
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
  return (
    <>
      <span onClick={onOpen}>{children}</span>
      {/* new group chat */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            textAlign={"center"}
            fontSize={"35px"}
            fontFamily={"Work sans"}
            display={"flex"}
            justifyContent={"center"}
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            pb={6}
          >
            <FormControl>
              <Input
                mb={"3"}
                placeholder="Chat Name"
                onChange={(e) => setgroupChatName(e.target.value)}
              />
            </FormControl>

            <FormControl mt={4}>
              <Input
                mb={"3"}
                placeholder="Add Users...."
                onChange={(e) => {
                  handerSearch(e);
                  setsearch(e.target.value);
                  console.log(e.target.value);
                }}
              />
            </FormControl>
            {/* selected users */}
            <Box
              display={"flex"}
              flexDirection={"row"}
              justifyContent={"flex-start"}
            >
              {selectedUsers.map((u) => (
                <UserBadgeitem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleDelete(u)}
                />
              ))}
            </Box>
            {/* render users */}
            {loading ? (
              <div>Loading</div>
            ) : (
              searchResult
                ?.slice(0, 4)
                .map((user) => (
                  <UserListitem
                    key={user._id}
                    user={user}
                    handleFunction={() => handelGroup(user)}
                  />
                ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handelSubmit}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
