import React, { useState, useEffect } from "react";
import { auth, googleProvider, db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { signInWithPopup, signOut } from "firebase/auth";

const Chat = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  // Login with Google
  const login = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (error) {
      console.error("Error logging in: ", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  useEffect(() => {
    const messagesQuery = query(
      collection(db, "messages"),
      orderBy("createdAt")
    );
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [user]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      await addDoc(collection(db, "messages"), {
        text: message,
        createdAt: new Date(),
        user: {
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
      });
      setMessage("");
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  return (
    <div style={styles.chatContainer}>
      <h1 style={styles.header}>Hola! Superchat 💬💬</h1>
      {user ? (
        <>
          <div style={styles.userInfo}>
            <strong style={{color: "#808080"}}>Welcome, {user.displayName}!</strong>
            <button onClick={logout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
          <div style={styles.messagesContainer}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  ...styles.messageContainer,
                  justifyContent:
                    msg.user.uid === user.uid ? "flex-end" : "flex-start",
                }}
              >
                {msg.user.uid !== user.uid && (
                  <img
                    src={msg.user.photoURL}
                    alt="profile"
                    style={styles.profilePic}
                  />
                )}
                <div
                  style={{
                    ...styles.message,
                    backgroundColor:
                      msg.user.uid === user.uid ? "#0c88f8" : "#fff",
                  }}
                >
                  <strong>{msg.user.displayName}</strong>: {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div style={styles.inputContainer}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              style={styles.input}
            />
            <button onClick={sendMessage} style={styles.sendButton}>
              Send
            </button>
          </div>
        </>
      ) : (
        <button onClick={login} style={styles.loginButton}>
          Login with Google
        </button>
      )}
    </div>
  );
};

const styles = {
    chatContainer: {
      padding: "8px",
      maxWidth: "800px",
      margin: "0px auto",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      backgroundColor: "#181717",
    },
    header: {
      textAlign: "left",
      marginBottom: "5px",
      marginTop: "5px",
      marginLeft: "5px",    
      fontSize: "30px",
      color: "#fff",
    },
    userInfo: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "15px",
    },
    logoutButton: {
      padding: "5px 10px",
      backgroundColor: "#ff4040",
      border: "none",
      borderRadius: "4px",
      color: "#fff",
      cursor: "pointer",
    },
    messagesContainer: {
      flexGrow: 1,
      overflowY: "auto",
      padding: "10px",
      backgroundColor: "#282535",
      borderRadius: "8px",
      marginBottom: "15px",
    },
    messageContainer: {
      display: "flex",
      alignItems: "center",
      marginBottom: "10px",
    },
    profilePic: {
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      marginRight: "10px",
    },
    message: {
      padding: "10px",
      borderRadius: "20px",
      maxWidth: "60%",
      wordWrap: "break-word",
      backgroundColor: "#f1f1f1",
    },
    inputContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    input: {
      width: "88%",
      padding: "10px",
      borderRadius: "10px",
      border: "1px solid #ddd",
      outline: "none",
      fontSize: "16px",
    },
    sendButton: {
      padding: "10px 20px",
      backgroundColor: "#0084ff",
      border: "none",
      borderRadius: "10px",
      color: "#fff",
      cursor: "pointer",
      fontSize: "16px",
    },
    loginButton: {
      padding: "10px 20px",
      backgroundColor: "#282535",
      border: "none",
      borderRadius: "4px",
      color: "#fff",
      cursor: "pointer",
      fontSize: "16px",
      alignSelf: "center",
      marginTop: "auto", 
      marginBottom: "auto",
    },
  };
  
export default Chat;
