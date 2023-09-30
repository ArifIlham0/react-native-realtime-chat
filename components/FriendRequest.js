import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { UserType } from "../UserContext";
import colors from "../constants/colors";

const FriendRequest = ({ item, friendRequests, setFriendRequests }) => {

    const { userId, setUserId } = useContext(UserType)
    const navigation = useNavigation()

    const acceptRequest = async (friendRequestId) => {
        try {
            const response = await fetch("http://10.0.2.2:8000/friend-request/accept", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body:JSON.stringify({
                    senderId:friendRequestId,
                    recipientId: userId
                })
            })

            if (response.ok) {
                setFriendRequests(
                    friendRequests.filter((request) => request._id !== friendRequestId)
                )
                navigation.navigate("Chats")
            }
        } catch (err) {
            console.log("error accepting the friend request", err);
        }
    }

    return (
        <Pressable style={styles.container}>
            <Image 
                style={styles.imageProfile}
                source={{ uri: item.image }}
            />

            <Text style={styles.textSent}>{item?.name} sent you a friend request!</Text>

            <Pressable 
                style={styles.containerAccept}
                onPress={() => acceptRequest(item._id)}
            >
                <Text style={styles.textAccept}>Accept</Text>
            </Pressable>
        </Pressable>
    );
};

export default FriendRequest;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    imageProfile: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    containerAccept: {
        backgroundColor: colors.blue,
        padding: 10,
        borderRadius: 6,
    },
    textAccept: {
        textAlign: 'center',
        color: 'white'
    },
    textSent: {
        fontSize: 15,
        fontWeight: 'bold',
        marginLeft: 10,
        flex: 1,
    }
});
