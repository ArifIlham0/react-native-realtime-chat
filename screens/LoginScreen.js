import { StyleSheet, Text, View, KeyboardAvoidingView, TextInput, Pressable, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage'

import colors from '../constants/colors'

const LoginScreen = () => {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigation = useNavigation();

    // useEffect(() => {
    //     const checkLoginStatus = async() => {

    //         try {
    //             const token = await AsyncStorage.getItem("authToken")

    //             if(token) {
    //                 navigation.replace("Home")
    //             } else {
    //                 // token not found, show the login screen itself
    //             }
    //         } catch (error) {
    //             console.log("Error", error);                                        
    //         }
    //     }
    //     checkLoginStatus()
    // }, [])

    const handleLogin = () => {
        const user = {
            email: email,
            password: password,
        }   

        axios
            .post("http://10.0.2.2:8000/login", user)
            .then((response) => {
                console.log(response);
                const token = response.data.token
                AsyncStorage.setItem("authToken", token)
                navigation.replace("Home")
            })
            .catch((error) => {
                Alert.alert("Login error", "Invalid email or password")
                console.log("Login error", error);
            })
    }

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView>
                <View style={styles.containerText}>
                    <Text style={styles.loginText}>Login</Text>
                    <Text style={styles.desc}>Login to your account</Text>
                </View>

                <View style={{ marginTop: 50 }}>
                    <View>
                        <Text style={styles.text}>Email</Text>
                        <TextInput 
                            value={email}
                            onChangeText={(text) => setEmail(text)}
                            style={{ 
                                borderBottomColor: 'gray', 
                                borderBottomWidth: 1, 
                                marginVertical: 10,  
                                width: 300, 
                                fontSize:email ? 18 : 18,
                            }}
                            placeholderTextColor={"black"}
                            placeholder="Enter your email"
                        />
                    </View>
                    <View style={{ marginTop: 10 }}>
                        <Text style={styles.text}>Password</Text>
                        <TextInput 
                            value={password}
                            onChangeText={(text) => setPassword(text)}
                            secureTextEntry={true}
                            style={{ 
                                borderBottomColor: 'gray', 
                                borderBottomWidth: 1, 
                                marginVertical: 10,  
                                width: 300, 
                                fontSize:email ? 18 : 18,
                            }}
                            placeholderTextColor={"black"}
                            placeholder="Password"
                        />
                    </View>

                    <Pressable 
                        onPress={handleLogin}
                        style={styles.pressLogin}
                    >
                        <Text style={styles.pressLoginText}>Login</Text>
                    </Pressable>

                    <Pressable onPress={() => navigation.navigate("Register")} style={{ marginTop: 15 }}>
                        <Text style={styles.dontHave}>Regsiter</Text>
                    </Pressable>

                </View>

            </KeyboardAvoidingView>
        </View>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 10,
        alignItems: 'center',
    },
    containerText: {
        marginTop: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        color: colors.green,
        fontSize: 17,
        fontWeight: '600',
    },
    desc: {
        fontSize: 17,
        fontWeight: '600',
        marginTop: 15,
    },
    text: {
        fontSize: 18,
        fontWeight: '600',
        color: 'gray',
    },
    pressLogin: {
        width: 200,
        backgroundColor: colors.green,
        padding: 15,
        marginTop: 50,
        marginLeft: 'auto',
        marginRight: 'auto',
        borderRadius: 6,
    },
    pressLoginText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    dontHave: {
        textAlign: 'center',
        color: 'gray',
        fontSize: 16,
    }

});
