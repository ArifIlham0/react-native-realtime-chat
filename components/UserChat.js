import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import { UserType } from "../UserContext";
import colors from "../constants/colors";

const UserChat = ({ item }) => {

    const {userId, setUserId} = useContext(UserType)
    const [messages, setMessages] = useState([])
    const navigation = useNavigation()

    const fetchMessages = async () => {
        try {
            const response = await fetch(`http://10.0.2.2:8000/messages/${userId}/${item._id}`)
            const data = await response.json()

            if (response.ok) {
                setMessages(data)
            } else {
                console.log("error showing messages", response.status.message);
            }
        } catch (error) {
            console.log("error fetching messages", error);
        }
    }

    useEffect(() => {
        fetchMessages()
    }, [])

    console.log(messages);

    const getLastMessage = () => {
        const userMessages = messages.filter((message) => message.messageType === "text")

        const n = userMessages.length

        return userMessages[n-1]
    }
    
    const lastMessage = getLastMessage()
    console.log(lastMessage);

    const formatTime = (time) => {
        const options = {hour: 'numeric', minute: 'numeric'}
        return new Date(time).toLocaleString("en-US", options)
    }

    return (
        <Pressable 
            style={styles.container}
            onPress={() => navigation.navigate("Messages", {
                recipientId: item._id,
            })}
        >
            <Image 
                source={{ uri: item?.image }}
                style={styles.profile}
            />

            <View style={{ flex: 1 }}>
                <Text style={styles.textName}>{item?.name}</Text>
                {lastMessage && (
                    <Text style={styles.textLast}>{lastMessage?.message}</Text>
                )}
                
            </View>

            <View>
                <Text style={styles.time}>
                    {lastMessage && formatTime(lastMessage?.timeStamp)}
                </Text>
            </View>
        </Pressable>
    );
};

export default UserChat;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderWidth: 0.7,
        borderColor: colors.black,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        padding: 10,

    },
    profile: {
        width: 50,
        height: 50,
        borderRadius: 25,
        resizeMode: 'cover',
    },
    textName: {
        fontSize: 15,
        fontWeight: '500'
    },
    textLast: {
        marginTop: 3,
        color: 'gray',
        fontWeight: '500',
    },
    time: {
        fontSize: 11,
        color: colors.grayTime,
        fontWeight: '400',
    }
});
