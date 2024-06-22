import { createContext, useContext,useState,useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";

import { getFirestore,collection,addDoc ,getDocs, getDoc,
  doc,
  query,
  where} from "firebase/firestore";
import {getStorage ,ref ,uploadBytes,getDownloadURL} from "firebase/storage";

const FirebaseContext = createContext(null);

const firebaseConfig = {
  apiKey: "AIzaSyAeVonHHwb0x5Rp0NFwGQbEKbhdV8RXEoM",
  authDomain: "bookify-320b1.firebaseapp.com",
  projectId: "bookify-320b1",
  storageBucket: "bookify-320b1.appspot.com",
  messagingSenderId: "796516707813",
  appId: "1:796516707813:web:fa5cd8e168e7ad1a33530c",
};

export const useFirebase = () => useContext(FirebaseContext);

const firebaseapp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseapp);
const firestore =getFirestore(firebaseapp);
const storage = getStorage(firebaseapp);

const gooleProvider = new GoogleAuthProvider();

export const FirebaseProvider =  (props) => {
  const [user,setUser] = useState(null)

  useEffect( () => {
    onAuthStateChanged(firebaseAuth,user => {
      if(user) setUser(user);
      else setUser(null);
    })
  },[])

  const signupUserWithEmailAndPassword = (email,password) =>
    createUserWithEmailAndPassword(firebaseAuth, email, password);

  const signinUserWithEmailAndPass = (email, password) =>
    signInWithEmailAndPassword(firebaseAuth, email, password);


  const signinWithGoogle = () => signInWithPopup(firebaseAuth,gooleProvider);


  const handleCreatedNewListing = async (name,isbn,price,cover) => {
    const imageRef = ref(storage,`uploads/images/${Date.now()}-${cover.name}`)
    const uploadResult = await uploadBytes(imageRef,cover);
     return await addDoc(collection(firestore ,'books') ,{
      name,
      isbn,
      price,
      imageURL:uploadResult.ref.fullPath,
      userID:user.uid,
      userEmail:user.email,
      displayName:user.displayName,
      photoURL:user.photoURL,
    });
  };

  const listAllBooks = () => {
    return getDocs(collection(firestore,"books"));
  };

  const getBookById = async (id) => {
    const docRef = doc(firestore, "books", id);
    const result = await getDoc(docRef);
    return result;
  };

  const getImageURL = (path) => {
    return getDownloadURL(ref(storage,path));
  };

  const placeOrder = async (bookId, qty) => {
    const collectionRef = collection(firestore, "books", bookId, "orders");
    const result = await addDoc(collectionRef, {
      userID: user.uid,
      userEmail: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      qty: Number(qty),
    });
    return result;
  };

  const fetchMyBooks = async (userId) => {
    const collectionRef = collection(firestore, "books");
    const q = query(collectionRef, where("userID", "==", userId));

    const result = await getDocs(q);
    return result;
  };

  const getOrders = async (bookId) => {
    const collectionRef = collection(firestore, "books", bookId, "orders");
    const result = await getDocs(collectionRef);
    return result;
  };


  const isLoggedIn = user ? true : false;

  return (
    <FirebaseContext.Provider
      value={{ 
        signinWithGoogle,
        signupUserWithEmailAndPassword, 
        signinUserWithEmailAndPass ,
        handleCreatedNewListing,
        listAllBooks,
        getImageURL,
        placeOrder,
        fetchMyBooks,
        getOrders,
        getBookById,
        isLoggedIn,
        user,
      }}
    >
      {props.children}
    </FirebaseContext.Provider>
  );
};
