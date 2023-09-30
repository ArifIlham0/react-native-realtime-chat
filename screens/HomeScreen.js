import { StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import jwt_decode from 'jwt-decode'
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { UserType } from "../UserContext";
import User from "../components/User";

const HomeScreen = () => {

    const navigation = useNavigation()
    const {userId, setUserId} = useContext(UserType)
    const [users, setUsers] = useState([])

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "",
            headerLeft: () => (
                <Text style={styles.textLeft}>AncaChat</Text>
            ),
            headerRight: () => (
                <View style={styles.containerRight}>
                    <Ionicons 
                        name="chatbox-ellipses-outline" 
                        size={24} 
                        color="black" 
                        onPress={() => navigation.navigate("Chats")}
                    />
                    <MaterialIcons 
                        name="people-outline" 
                        size={24} 
                        color="black" 
                        onPress={() => navigation.navigate("Friends")}
                    />
                </View>
            ),
        })
    }, [])

    useEffect(() => {
        const fetchUsers = async () => {
            const token = await AsyncStorage.getItem("authToken")
            const decodedToken = jwt_decode(token)
            const userId = decodedToken.userId
            setUserId(userId)

            axios
                .get(`http://10.0.2.2:8000/users/${userId}`)
                .then((response) => {
                    setUsers(response.data)
                })
                .catch((error) => {
                    console.log("Error retrieving users", error);
                })
        }
        fetchUsers()
    }, [])

    console.log("users", users);

    return (
        <View>
            <View style={{ padding: 10 }}>
                {users.map(( item, index ) => (
                    <User key={index} item={item}/>
                ))}
            </View>
        </View>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    textLeft: {
        fontSize: 16, 
        fontWeight: "bold",
    },
    containerRight: {
        flexDirection: "row", 
        alignItems: "center", 
        gap: 8,
    },
});
