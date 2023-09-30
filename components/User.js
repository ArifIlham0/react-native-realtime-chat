import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { UserType } from "../UserContext";
import colors from '../constants/colors'

const User = ({ item }) => {

  const {userId, setUserId} = useContext(UserType)
  const [requestSent, setRequestSent] = useState(false)
  const [friendRequests, setFriendRequests] = useState([])
  const [userFriends, setUserFriends] = useState([])

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const response = await fetch(`http://10.0.2.2:8000/friend-requests/sent/${userId}`)

        const data = await response.json()
        if (response.ok) {
          setFriendRequests(data)
        } else {
          console.log("error", response.status);
        }
      } catch (error) {
        console.log("error", error);
      }
    }

    fetchFriendRequests()
  }, [])

  useEffect(() => {
    const fetchUserFriends = async () => {
      try {
        const response = await fetch(`http://10.0.2.2:8000/friends/${userId}`)

        const data = await response.json()
        if (response.ok) {
          setUserFriends(data)
        } else {
          console.log("error retrieving user friends", response.status);
        }
      } catch (error) {
        console.log("Error message", error);
      }
    }

    fetchUserFriends()
  }, [])
  

  const sendFriendRequest = async (currentUserId, selectedUserId) => {
    try {
      const response = await fetch("http://10.0.2.2:8000/friend-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentUserId, selectedUserId })
      })

      if (response.ok) {
        setRequestSent(true)
      }
    } catch (error) {
      console.log("error message", error);
    }
  }

  console.log("friend requests sent", friendRequests);
  console.log("user friends", userFriends);
  return (
    <Pressable style={styles.container}>
      <View>
        <Image 
          style={styles.profile}
          source={{ uri: item.image }}
        />
      </View>

      <View style={styles.containerName}>
        <Text style={{ fontWeight: 'bold' }}>{item?.name}</Text>
        <Text style={styles.itemEmail}>{item?.email}</Text>
      </View>

      {userFriends.includes(item._id) ? (
        <Pressable
          style={{ 
            backgroundColor: '#82CD47',
            padding: 10,
            width: 105,
            borderRadius: 6,
          }}
        >
          <Text style={{ textAlign: 'center', color: 'white' }}>Friends</Text>
        </Pressable>
      ) : requestSent || friendRequests.some((friend) => friend._id === item._id) ? (
        <Pressable
          style={{ 
            backgroundColor: 'gray',
            padding: 10,
            width: 105,
            borderRadius: 6,
          }}
        >
          <Text style={{ textAlign: 'center', color: 'white', fontSize: 13 }}>Request Sent</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => sendFriendRequest(userId, item._id)}
          style={{ 
            backgroundColor: colors.gray,
            padding: 10,
            width: 105,
            borderRadius: 6,
          }}
        >
          <Text style={{ textAlign: 'center', color: 'white', fontSize: 13 }}>Add Friend</Text>
        </Pressable>
      )}
    </Pressable>
  );
};

export default User;

const styles = StyleSheet.create({
  profile: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: "cover",
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  pressAdd: {
    backgroundColor: colors.gray,
    padding: 10,
    borderRadius: 6,
    width: 105,
  },
  containerName: {
    marginLeft: 12,
    flex: 1.
  },
  textAdd: {
    textAlign: 'center',
    color: 'white',
    fontSize: 13,
  },
  itemEmail: {
    marginTop: 4,
    color: 'gray',
  }
});
