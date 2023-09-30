import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import { UserType } from "../UserContext";
import UserChat from "../components/UserChat";

const ChatScreen = () => {

  const [acceptedFriends, setAcceptedFriends] = useState([])
  const {userId, setUserId} = useContext(UserType)
  const navigation = useNavigation()
  
  useEffect(() => {
    const acceptedFriendsList = async () => {
      try {
        const response = await fetch(
          `http://10.0.2.2:8000/accepted-friends/${userId}`
        )
        const data = await response.json()

        if (response.ok) {
          setAcceptedFriends(data)
        }
      } catch (error) {
        console.log("error showing the accepted friends", error);        
      }
    }

    acceptedFriendsList()
  }, [])
  console.log("friends", acceptedFriends);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Pressable>
        {acceptedFriends.map((item, index) => (
          <UserChat key={index} item={item}/>
        ))}
      </Pressable>
    </ScrollView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({});
