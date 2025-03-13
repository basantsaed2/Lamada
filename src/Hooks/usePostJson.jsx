import axios from "axios";
import { useState } from "react";
import { useAuth } from "../Context/Auth"; // Make sure to import useAuth if required
import { useSelector } from "react-redux";

export const usePost = ({ url, login = false, type = false }) => {
       const auth = useAuth();
       const user = useSelector(state => state.userLamada);
       const [loadingPost, setLoadingPost] = useState(false);
       const [response, setResponse] = useState(null);

       const postData = async (data, name) => {
              setLoadingPost(true);
              try {
                     const token = auth?.userState?.token || '';
                     const contentType = type ? 'application/json' : 'multipart/form-data';
                     const config = !login && token
                            ? {
                                   headers: {
                                          'Content-Type': contentType,
                                          'Authorization': `Bearer ${token || ''}`,
                                   },
                            }
                            : {
                                   headers: { 'Content-Type': contentType },
                            };

                     const response = await axios.post(url, data, config);

                     if (response.status === 200) {
                            setResponse(response);
                            { name ? auth.toastSuccess(name) : '' }
                            // auth.toastSuccess(name)
                     }
              } catch (error) {
                     if (error.response?.data?.errors) {
                            Object.entries(error.response.data.errors).forEach(([messages]) => {
                                   // Show a toast for each error message
                                   messages.forEach((message) => {
                                          auth.toastError(`${message}`);
                                   });
                            });
                     } else {
                            auth.toastError(error.message);
                     }

                     console.error('Error posting JSON:', error);

              } finally {
                     setLoadingPost(false);
              }
       };

       return { postData, loadingPost, response };
};
