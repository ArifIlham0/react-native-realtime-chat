import { Image, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Entypo } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import EmojiSelector from "react-native-emoji-selector";
import * as ImagePicker from 'expo-image-picker'

import { UserType } from "../UserContext";
import colors from "../constants/colors";

const ChatMessagesScreen = () => {

    const [showEmojiSelector, setShowEmojiSelector] = useState(false)
    const [message, setMessage] = useState("")
    const [selectedImage, setSelectedImage] = useState("")
    const [recipientData, setRecipientData] = useState()
    const [messages, setMessages] = useState([])
    const [selectedMessages, setSelectedMessages] = useState([])
    const {userId, setUserId} = useContext(UserType)
    const route = useRoute()
    const navigation = useNavigation()
    const {recipientId} = route.params

    const scrollViewRef = useRef(null)

    useEffect(() => {
        scrollToBottom()
    }, [])

    const scrollToBottom = () => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: false })
        }
    }

    const handleContentSizeChange = () => {
        scrollToBottom()
    }

    const handleEmojiPress = () => {
        setShowEmojiSelector(!showEmojiSelector)
    }

    const fetchMessages = async () => {
        try {
            const response = await fetch(`http://10.0.2.2:8000/messages/${userId}/${recipientId}`)
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

    useEffect(() => {
        const fetchRecipientData = async () => {
            try {
                const response = await fetch(`http://10.0.2.2:8000/user/${recipientId}`)

                const data = await response.json()
                setRecipientData(data)
            } catch (error) {
                console.log("error retrieving details", error);
            }
        }

        fetchRecipientData()
    }, [])

    const handleSend = async (messageType, imageUri) => {
        try {
            const formData = new FormData()
            formData.append("senderId", userId)
            formData.append("recipientId", recipientId)

            // if the message type id image or a normal text
            if (messageType === "image") {
                formData.append("messageType", "image")
                formData.append("imageFile", {
                    uri: imageUri,
                    name: "image.jpg",
                    type: "image/jpeg",
                })
            } else {
                formData.append("messageType", "text")
                formData.append("messageText", message)
            }

            const response = await fetch("http://10.0.2.2:8000/messages", {
                method: 'POST',
                body: formData,
            })

            if (response.ok) {
                setMessage("")
                setSelectedImage("")

                fetchMessages()
            }
        } catch (error) {
            console.log("error is sending the message", error);
        }
    }

    console.log("messages", selectedMessages);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "",
            headerLeft: () => (
                <View style={styles.containerLayout}>
                    <Ionicons 
                        name="arrow-back" 
                        size={24} 
                        color="black"
                        onPress={() => navigation.goBack()}
                    />

                    {selectedMessages.length > 0 ? (
                        <View>
                            <Text style={styles.messageSelect}>{selectedMessages.length}</Text>
                        </View>
                    ) : (
                        <View style={styles.containerHeader}>
                            <Image 
                                style={styles.profile}
                                source={{ uri: recipientData?.image }}
                            />

                            <Text style={styles.textName}>{recipientData?.name}</Text>
                        </View>
                    )}

                    
                </View>
            ),

            headerRight: () => selectedMessages.length > 0 ? (
                <View style={styles.selectedIcon}>
                    <Ionicons name="md-arrow-redo-sharp" size={24} color="black" />
                    <Ionicons name="md-arrow-undo" size={24} color="black" />
                    <FontAwesome name="star" size={24} color="black" />
                    <MaterialIcons 
                        name="delete" 
                        size={24} 
                        color="black" 
                        onPress={() => deleteMessages(selectedMessages)}
                    />
                </View>
            ) : null
        })
    }, [recipientData, selectedMessages])

    const deleteMessages = async (messageIds) => {
        try {
            const response = await fetch("http://10.0.2.2:8000/deleteMessages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ messages: messageIds })
            })

            if (response.ok) {
                setSelectedMessages((previousMessages) =>
                    previousMessages.filter((id) => !messageIds.includes(id))
                )

                fetchMessages()
            } else {
                console.log("error deleting messages", response.status);
            }
        } catch (error) {
            console.log("error detecting messages", error);
        }
    }

    const formatTime = (time) => {
        const options = {hour: 'numeric', minute: 'numeric'}
        return new Date(time).toLocaleString("en-US", options)
    }

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            handleSend("image", result.uri)
        }
    }

    const handleSelectMessage = (message) => {
        // check if the message is already selected
        const isSelected = selectedMessages.includes(message._id)

        if (isSelected) {
            setSelectedMessages((previousMessages) => 
                previousMessages.filter((id) => id !== message._id)
            )
        } else {
            setSelectedMessages((previousMessages) => [
                ...previousMessages,
                message._id,
            ])
        }
    }

    return (
        <KeyboardAvoidingView style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={{ flexGrow: 1 }}
                onContentSizeChange={handleContentSizeChange}
            >
                {messages.map(( item, index ) => {
                    if (item.messageType === "text") {
                        const isSelected = selectedMessages.includes(item._id)
                        return (
                            <Pressable
                                onLongPress={() => handleSelectMessage(item)}
                                key={index}
                                style={[
                                    item?.senderId?._id === userId
                                        ? {
                                            alignSelf: 'flex-end',
                                            backgroundColor: colors.nearlyGreen,
                                            padding: 8,
                                            maxWidth: '60%',
                                            borderRadius: 7,
                                            margin: 10,
                                        }
                                        : {
                                            alignSelf: 'flex-start',
                                            backgroundColor: 'white',
                                            padding: 8,
                                            margin: 10,
                                            maxWidth: '60%',
                                            borderRadius: 7,
                                        },

                                        isSelected && { width: '100%', backgroundColor: colors.nearlyWhite }
                                ]}
                            >
                                <Text 
                                    style={{ fontSize: 13, textAlign: isSelected ? "right" : "left" }}>
                                        {item?.message}
                                </Text>
                                <Text style={styles.itemTime}>{formatTime(item.timeStamp)}</Text>
                            </Pressable>
                        )
                    }
                    
                    if (item.messageType === "image") {
                        const baseUrl = "/belajarNgoding/reactnative/ancaChat/api/files/"
                        const imageUrl = item.imageUrl
                        const filename = imageUrl.split("/").pop()
                        const source = {uri: baseUrl + filename}

                        return (
                            <Pressable
                                key={index}
                                style={[
                                    item?.senderId?._id === userId
                                        ? {
                                            alignSelf: 'flex-end',
                                            backgroundColor: colors.nearlyGreen,
                                            padding: 8,
                                            maxWidth: '60%',
                                            borderRadius: 7,
                                            margin: 10,
                                        }
                                        : {
                                            alignSelf: 'flex-start',
                                            backgroundColor: 'white',
                                            padding: 8,
                                            margin: 10,
                                            maxWidth: '60%',
                                            borderRadius: 7,
                                        },
                                ]}
                            >
                                <View>
                                    <Image 
                                        source={source}
                                        style={styles.imageSend}
                                    />
                                    <Text style={styles.timeSend}>{formatTime(item?.timeStamp)}</Text>
                                </View>
                            </Pressable>
                        )
                    }

                })}
            </ScrollView>

            <View style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 10,
                paddingVertical: 10,
                borderTopWidth: 1,
                borderTopColor: colors.blackBorder,
                marginBottom: showEmojiSelector ? 0 : 25,
            }}>
                <Entypo 
                    name="emoji-happy" 
                    size={24} 
                    color="gray" 
                    onPress={handleEmojiPress}
                    style={{ marginRight: 5 }}
                />
                <TextInput 
                    value={message}
                    onChangeText={(text) => setMessage(text)}
                    style={styles.inputChat}
                    placeholder="Type your message.."
                />

                <View style={styles.containerIcons}>
                    <Entypo 
                        name="camera" 
                        size={24} 
                        color="gray" 
                        onPress={pickImage}
                    />
                    <Feather name="mic" size={24} color="gray" />
                </View>

                <Pressable 
                    onPress={() => handleSend("text")}
                    style={styles.containerSend}
                >
                    <Text style={styles.textSend}>Send</Text>
                </Pressable>
            </View>

            {showEmojiSelector && (
                <EmojiSelector 
                    onEmojiSelected={(emoji) => {
                        setMessage((prevMessage) => prevMessage + emoji)
                    }}
                    style={{ height: 250 }}
                />
            )}
        </KeyboardAvoidingView>
    );
};

export default ChatMessagesScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white
    },
    inputChat: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: colors.blackBorder,
        borderRadius: 20,
        paddingHorizontal: 10,
    },
    containerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        marginHorizontal: 8,
    },
    containerSend: {
        backgroundColor: colors.green,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    textSend: {
        color: 'white',
        fontWeight: 'bold',
    }, 
    profile: {
        width: 30,
        height: 30,
        borderRadius: 15,
        resizeMode: 'cover',
    }, 
    containerLayout: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    containerHeader: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    textName: {
        marginLeft: 5,
        fontSize: 15,
        fontWeight: 'bold'
    },
    itemTime: {
        textAlign: 'right',
        fontSize: 9,
        color: 'gray',
        marginTop: 5,
    },
    imageSend: {
        width: 200,
        height: 200,
        borderRadius: 7,
    },
    timeSend: {
        textAlign: 'right',
        fontSize: 9,
        position: 'absolute',
        right: 10,
        bottom: 7,
        color: 'white',
        marginTop: 5,
    },
    messageSelect: {
        fontSize: 16,
        fontWeight: '500',
    },
    selectedIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    }
});
