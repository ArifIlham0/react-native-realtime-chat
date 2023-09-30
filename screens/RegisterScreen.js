import { StyleSheet, Text, View, TextInput, KeyboardAvoidingView, Pressable, Alert } from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

import colors from "../constants/colors";

const RegisterScreen = () => {

    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const [image, setImage] = useState("")
    const navigation = useNavigation();

    const handleRegister = () => {
        const user = {
            name: name,
            email: email,
            password: password,
            image: image,
        }

        // send a POST request to the backend API to register user
        axios
            .post("http://10.0.2.2:8000/register", user)
            .then((response) => {
                console.log(response);
                Alert.alert(
                    "Registration succesful",
                    "You have been registered succesfully"
                )
                setName("")
                setEmail("")
                setPassword("")
                setImage("")
            })
            .catch((error) => {
                Alert.alert(
                    "Registration Error",
                    "An error occured while registering"
                )
                console.log("registration failed", error);
            })
    }

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView>
                <View style={styles.containerText}>
                    <Text style={styles.registerText}>Register</Text>
                    <Text style={styles.desc}>Register to your account</Text>
                </View>

                <View style={{ marginTop: 50 }}>
                    <View>
                        <Text style={styles.text}>Name</Text>
                        <TextInput 
                            value={name}
                            onChangeText={(text) => setName(text)}
                            style={{ 
                                borderBottomColor: 'gray', 
                                borderBottomWidth: 1, 
                                marginVertical: 10,  
                                width: 300, 
                                fontSize:email ? 18 : 18,
                            }}
                            placeholderTextColor={"black"}
                            placeholder="Enter your name"
                        />
                    </View>
                    <View style={{ marginTop: 10 }}>
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
                    <View style={{ marginTop: 10 }}>
                        <Text style={styles.text}>Image</Text>
                        <TextInput 
                            value={image}
                            onChangeText={(text) => setImage(text)}
                            style={{ 
                                borderBottomColor: 'gray', 
                                borderBottomWidth: 1, 
                                marginVertical: 10,  
                                width: 300, 
                                fontSize:email ? 18 : 18,
                            }}
                            placeholderTextColor={"black"}
                            placeholder="Only Url Image"
                        />
                    </View>

                    <Pressable 
                        onPress={handleRegister}
                        style={styles.pressRegister}
                    >
                        <Text style={styles.pressRegisterText}>Register</Text>
                    </Pressable>

                    <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 15 }}>
                        <Text style={styles.dontHave}>Login</Text>
                    </Pressable>

                </View>

            </KeyboardAvoidingView>
        </View>
    );
};

export default RegisterScreen;

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
    registerText: {
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
    pressRegister: {
        width: 200,
        backgroundColor: colors.green,
        padding: 15,
        marginTop: 50,
        marginLeft: 'auto',
        marginRight: 'auto',
        borderRadius: 6,
    },
    pressRegisterText: {
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
