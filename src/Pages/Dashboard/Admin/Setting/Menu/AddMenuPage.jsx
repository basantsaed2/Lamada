import React, { useEffect, useRef, useState } from 'react';
import { StaticButton, StaticLoader, SubmitButton, Switch, UploadInput } from '../../../../../Components/Components';
import { usePost } from '../../../../../Hooks/usePostJson';
import { useAuth } from '../../../../../Context/Auth';

const AddMenuPage = ({ update, setUpdate }) => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/settings/menue/add`
    });

    const auth = useAuth();
    const [menus, setMenus] = useState([{ id: Date.now(), image: '', imageFile: null, status: 0 }]);
    const imageRefs = useRef([]);

    const handleImageChange = (e, id) => {
        const file = e.target.files[0];
        if (file) {
            setMenus(prevMenus => prevMenus.map(menu => 
                menu.id === id ? { ...menu, imageFile: file, image: file.name } : menu
            ));
        }
    };
    const handleImageClick = (index) => {
        if (imageRefs.current[index]) {
            imageRefs.current[index].click();
        }
    };    

    const handleMenuStatus = (id) => {
        setMenus(prevMenus => prevMenus.map(menu => 
            menu.id === id ? { ...menu, status: menu.status === 0 ? 1 : 0 } : menu
        ));
    };

    const addMoreMenu = () => {
        setMenus([...menus, { id: Date.now(), image: '', imageFile: null, status: 0 }]);
    };

    const removeMenu = (id) => {
        if (menus.length > 1) {
            setMenus(menus.filter(menu => menu.id !== id));
        }
    };

    useEffect(() => {
        if (!loadingPost) {
            handleReset();
        }
        setUpdate(!update);
    }, [response]);

    const handleReset = () => {
        setMenus([{ id: Date.now(), image: '', imageFile: null, status: 0 }]);
    };

    const handleMenuAdd = (e) => {
        e.preventDefault();
        
        if (menus.some(menu => !menu.imageFile)) {
            auth.toastError('Please set all menu images');
            return;
        }

        const formData = new FormData();
        menus.forEach((menu, index) => {
            formData.append(`images[${index}][image]`, menu.imageFile);
            formData.append(`images[${index}][status]`, menu.status);
        });

        postData(formData, 'Menu Added Successfully');
    };

    return (
        <>
            {loadingPost ? (
                <div className="w-full h-56 flex justify-center items-center">
                    <StaticLoader />
                </div>
            ) : (
                <section>
                    <form onSubmit={handleMenuAdd}>
                        {menus.map((menu, index) => (
                        <div key={menu.id} className="sm:py-3 lg:py-6">
                            <div className="w-full flex sm:flex-col lg:flex-row flex-wrap items-center justify-start gap-4">
                                    <div className="sm:w-full lg:w-[30%] flex flex-col items-start gap-y-1">
                                        <span className="text-xl font-TextFontRegular text-thirdColor">Menu Image:</span>
                                         <UploadInput
                                            value={menu.image}
                                            uploadFileRef={(el) => (imageRefs.current[index] = el)}
                                            onClick={() => handleImageClick(index)}
                                            placeholder="Menu Image"
                                            handleFileChange={(e) => handleImageChange(e, menu.id)}
                                            onChange={(e) => setImage(e.target.value)}
                                            // onClick={() => handleImageClick(ImageRef)}
                                        />
                                    </div>
                                     <div className="sm:w-full lg:w-[15%] flex items-start justify-start gap-x-1 pt-8">
                                            <div className='w-2/4 flex items-center justify-start gap-x-1'>
                                                    <span className="text-xl font-TextFontRegular text-thirdColor">Status:</span>
                                                    <Switch handleClick={() => handleMenuStatus(menu.id)} checked={menu.status} />
                                            </div>
                                    </div>
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            className="text-mainColor text-lg mt-2 md:mt-8 hover:bg-mainColor hover:text-white px-2 py-2 rounded-md"
                                            onClick={() => removeMenu(menu.id)}
                                        >
                                           - Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="text-mainColor text-lg mt-2 mb-2"
                            onClick={addMoreMenu}
                        >
                            + Add More Menu Image
                        </button>
                    
                         <div className="w-full flex items-center justify-end gap-x-4">
                            <div className="">
                                <StaticButton text={'Reset'} handleClick={handleReset} bgColor='bg-transparent' Color='text-mainColor' border={'border-2'} borderColor={'border-mainColor'} rounded='rounded-full' />
                            </div>
                            <div className="">
                                <SubmitButton
                                        text={'Submit'}
                                        rounded='rounded-full'
                                        handleClick={handleMenuAdd}
                                />
                            </div>
                        </div>
                    </form>
                </section>
            )}
        </>
    );
};

export default AddMenuPage;
