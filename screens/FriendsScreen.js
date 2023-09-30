import { StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import { UserType } from "../UserContext";
import FriendRequest from "../components/FriendRequest";

const FriendsScreen = () => {
    
    const { userId, setUserId } = useContext(UserType)
    const [friendRequests, setFriendRequests] = useState([])
    useEffect(() => {
        fetchFriendRequests()
    }, [])

    const fetchFriendRequests = async () => {
        try {
            const response = await axios.get(`http://10.0.2.2:8000/friend-request/${userId}`)
            if (response.status === 200) {
                const friendRequestsData = response.data.map((friendRequest) => ({
                    _id: friendRequest._id,
                    name: friendRequest.name,
                    email: friendRequest.email,
                    image: friendRequest.image,
                }))

                setFriendRequests(friendRequestsData)
            }
        } catch (err) {
            console.log("error message", err);
        }
    }
    console.log(friendRequests);

    return (
        <View style={styles.container}>
            {friendRequests.length > 0 && <Text>Your Friend Requests!</Text>}

            {friendRequests.map(( item, index ) => (
                <FriendRequest 
                    key={index}
                    item={item}
                    friendRequest={friendRequests}
                    setFriendRequests={setFriendRequests}
                />
            ))}
        </View>
    );
};

export default FriendsScreen;

const styles = StyleSheet.create({
    container: {
        padding: 10,
        marginHorizontal: 12,
    }
});
