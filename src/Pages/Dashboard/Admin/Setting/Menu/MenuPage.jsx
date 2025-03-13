import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGet } from '../../../../../Hooks/useGet';
import { useChangeState } from '../../../../../Hooks/useChangeState';
import { useDelete } from '../../../../../Hooks/useDelete';
import { StaticLoader, Switch } from '../../../../../Components/Components';
import { DeleteIcon, EditIcon } from '../../../../../Assets/Icons/AllIcons';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import Warning from '../../../../../Assets/Icons/AnotherIcons/WarningIcon';
import { AiOutlineClose } from "react-icons/ai";

const MenuPage = ({ refetch }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { refetch: refetchMenu, loading: loadingMenu, data: dataMenu } = useGet({
    url: `${apiUrl}/admin/settings/menue`
  });
  const { changeState, loadingChange, responseChange } = useChangeState();
  const { deleteData, loadingDelete, responseDelete } = useDelete();

  const [menus, setMenus] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const [openDelete, setOpenDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const menuPerPage = 20; // Limit to 20 menus per page

  // Calculate total number of pages
  const totalPages = Math.ceil(menus.length / menuPerPage);

  // Get the menus for the current page
  const currentMenu = menus.slice(
    (currentPage - 1) * menuPerPage,
    currentPage * menuPerPage
  );

  // handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Fetch categories when the component mounts or when refetch is called
  useEffect(() => {
    refetchMenu();
  }, [refetchMenu, refetch]); // Empty dependency array to only call refetch once on mount


  // Change menus image status 
  const handleChangeStaus = async (id, name, status) => {
    const response = await changeState(
      `${apiUrl}/admin/settings/menue/status/${id}`,
      `${name} Changed Status.`,
      { status } // Pass status as an object if changeState expects an object
    );

    if (response) {
      setMenus((prevMenu) =>
        prevMenu.map((menu) =>
          menu.id === id ? { ...menu, status: status } : menu
        )
      );
    }
    // Log the updated categories after the state update
    setMenus((prevMenu) => {
      const updatedMenu = prevMenu.map((menu) =>
        menu.id === id ? { ...menu, status: status } : menu
      );
      console.log('Updated Menu:', updatedMenu);
      return updatedMenu;
    });
  };

  const handleOpenDelete = (item) => {
    setOpenDelete(item);
  };
  const handleCloseDelete = () => {
    setOpenDelete(null);
  };

  const handleImageClick = (imageLink) => {
    setSelectedImage(imageLink);
  };

  const handleCloseOverlay = () => {
      setSelectedImage(null);
  };
  // Delete menu image
  const handleDelete = async (id, name) => {
    const success = await deleteData(`${apiUrl}/admin/settings/menue/delete/${id}`, `${name} Deleted Success.`);

    if (success) {
      // Update categories only if changeState succeeded
      setMenus(
        menus.filter((menu) =>
          menu.id !== id
        )
      );
    }
    console.log('Menu Image', menu)
  };

  // Update categories when `data` changes
  useEffect(() => {
    if (dataMenu && dataMenu.images) {
      setMenus(dataMenu.images);
    }
    console.log('dataMenu', dataMenu)
  }, [dataMenu]); // Only run this effect when `data` changes



  const headers = ['#',"Image",'Status', 'Action'];

  return (
    <div className="w-full pb-28 flex items-start justify-start overflow-x-scroll scrollSection">
      {loadingMenu || loadingChange || loadingDelete ? (
        <div className='w-full mt-40'>
          <StaticLoader />
        </div>
      ) : (
        <div className='w-full flex flex-col'>
          <table className="w-full sm:min-w-0 block overflow-x-scroll scrollPage">
            <thead className="w-full">
              <tr className="w-full border-b-2">
                {headers.map((name, index) => (
                  <th className="min-w-[120px] sm:w-[8%] lg:w-[5%] text-mainColor text-center font-TextFontLight sm:text-sm lg:text-base xl:text-lg pb-3" key={index}>
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="w-full">
              {menus.length === 0 ? (
                <tr>
                  <td colSpan={12} className='text-center text-xl text-mainColor font-TextFontMedium  '>Not find menu</td>
                </tr>
              ) : (
                currentMenu.map((menu, index) => (
                  <tr className="w-full border-b-2" key={index}>
                    <td className="min-w-[80px] sm:min-w-[50px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {(currentPage - 1) * menuPerPage + index + 1}
                    </td>
                    <td className="flex justify-center cursor-pointer" onClick={() => handleImageClick(menu.image_link)}>
                      <img 
                          src={menu.image_link} 
                          className="bg-mainColor rounded-full min-w-14 min-h-14 max-w-14 max-h-14"
                          alt="Photo"
                      />
                  </td>
                    <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      <Switch
                        checked={menu.status === 1}
                        handleClick={() => {
                          handleChangeStaus(menu.id, menu.id, menu.status === 1 ? 0 : 1);
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* <Link to={`edit/${menu.id}`}  ><EditIcon /></Link> */}
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(menu.id)}
                        >
                          <DeleteIcon />
                        </button>
                        {openDelete === menu.id && (
                          <Dialog
                            open={true}
                            onClose={handleCloseDelete}
                            className="relative z-10"
                          >
                            <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                  <div className="flex  flex-col items-center justify-center bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <Warning
                                      width="28"
                                      height="28"
                                      aria-hidden="true"
                                    />
                                    <div className="flex items-center">
                                      <div className="mt-2 text-center">
                                        You will delete menu image {menu?.id || "-"}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                    <button className="inline-flex w-full justify-center rounded-md bg-mainColor px-6 py-3 text-sm font-TextFontSemiBold text-white shadow-sm sm:ml-3 sm:w-auto" onClick={() => handleDelete(menu.id, menu.id)}>
                                      Delete
                                    </button>

                                    <button
                                      type="button"
                                      data-autofocus
                                      onClick={handleCloseDelete}
                                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-6 py-3 text-sm font-TextFontMedium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:mt-0 sm:w-auto"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </DialogPanel>
                              </div>
                            </div>
                          </Dialog>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Full-Screen Overlay */}
          {selectedImage && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50 p-6 md:p-8">
              {/* Close Button */}
              <button
                  className="absolute top-5 right-5 bg-white text-black p-2 rounded-full shadow-lg hover:bg-gray-300 transition"
                  onClick={handleCloseOverlay}
              >
                  <AiOutlineClose size={24} className="text-mainColor"/>
              </button>

              {/* Display Full Image */}
              <img src={selectedImage} className="max-w-full max-h-full rounded-lg shadow-lg" alt="Enlarged" />
            </div>
          )}

          {menus.length > 0 && (
            <div className="my-6 flex flex-wrap items-center justify-center gap-x-4">
              {currentPage !== 1 && (
                <button type='button' className='text-lg px-4 py-2 rounded-xl bg-mainColor text-white font-TextFontMedium' onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 mx-1 text-lg font-TextFontSemiBold rounded-full duration-300 ${currentPage === page ? 'bg-mainColor text-white' : ' text-mainColor'}`}
                >
                  {page}
                </button>
              ))}
              {totalPages !== currentPage && (
                <button type='button' className='text-lg px-4 py-2 rounded-xl bg-mainColor text-white font-TextFontMedium' onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MenuPage;
