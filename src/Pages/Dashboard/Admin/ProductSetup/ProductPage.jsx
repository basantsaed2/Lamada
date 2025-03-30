import { useEffect, useState } from 'react'
import { useGet } from '../../../../Hooks/useGet';
import { AddButton, LoaderLogin, SearchBar, StaticLoader } from '../../../../Components/Components';
import { DeleteIcon, EditIcon } from '../../../../Assets/Icons/AllIcons';
import { useDelete } from '../../../../Hooks/useDelete';
import { Link } from 'react-router-dom';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import Warning from '../../../../Assets/Icons/AnotherIcons/WarningIcon';
import * as XLSX from 'xlsx';
import { usePost } from '../../../../Hooks/usePostJson';
import { FaUpload, FaDownload } from 'react-icons/fa';

const ProductPage = () => {
       const apiUrl = import.meta.env.VITE_API_BASE_URL;
       const { refetch: refetchProducts, loading: loadingProducts, data: dataProducts } = useGet({
              url: `${apiUrl}/admin/product`
       });
       const { postData, loadingPost, response } = usePost({ url: `${apiUrl}/admin/product/import_excel` });
       const { deleteData, loadingDelete, responseDelete } = useDelete();
       const [selectedFile, setSelectedFile] = useState(null);

       const [products, setProducts] = useState([])
       const [textSearch, setTextSearch] = useState('');
       const [filteredProducts, setFilteredProducts] = useState([]);

       const [openDescriptionView, setOpenDescriptionView] = useState(null);
       const [openAddonsView, setOpenAddonsView] = useState(null);
       const [openVariationsView, setOpenVariationsView] = useState(null);
       const [openExcludesView, setOpenExcludesView] = useState(null);
       const [openExtraView, setOpenExtraView] = useState(null);

       const [openDelete, setOpenDelete] = useState(null);

       const [currentPage, setCurrentPage] = useState(1); // Track the current page
       const productsPerPage = 20; // Limit to 20 products per page

       // Calculate total number of pages
       const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

       // Get the products for the current page
       const currentProducts = filteredProducts.slice(
              (currentPage - 1) * productsPerPage,
              currentPage * productsPerPage
       );

       useEffect(() => {
              if (dataProducts && dataProducts.products) {
                     setProducts(dataProducts.products)
                     setFilteredProducts(dataProducts.products)
              }

              console.log('dataProducts', dataProducts)
              console.log('products', products)
       }, [dataProducts])

       
         useEffect(() => {
           if (response && response.status === 200 && !loadingPost) {
              setSelectedFile(null);
           }
         }, [response]);
       

       const handleFilterData = (e) => {
              const text = e.target.value;
              setTextSearch(text);

              if (!products || !Array.isArray(products)) {
                     console.error('Invalid products data:', products);
                     return;
              }

              if (text === '') {
                     setFilteredProducts(products); // Reset if input is empty
              } else {
                     console.log('Filtering for text:', text);

                     const filter = products.filter((product) =>
                            product.name.toLowerCase().includes(text.toLowerCase())
                     );

                     setFilteredProducts(filter); // Update state
                     console.log('Filtered products:', filter); // Debugging
              }

       };

       // handle page change
       const handlePageChange = (pageNumber) => {
              setCurrentPage(pageNumber);
       };


       const handleOpenDescriptionView = (productId) => {
              setOpenDescriptionView(productId);
       };
       const handleOpenAddonsView = (productId) => {
              setOpenAddonsView(productId);
       };
       const handleOpenVariationsView = (productId) => {
              setOpenVariationsView(productId);
       };
       const handleOpenExcludesView = (productId) => {
              setOpenExcludesView(productId);
       };
       const handleOpenExtraView = (productId) => {
              setOpenExtraView(productId);
       };

       const handleCloseDescriptionView = () => {
              setOpenDescriptionView(null);
       };
       const handleCloseAddonsView = () => {
              setOpenAddonsView(null);
       };
       const handleCloseVariationsView = () => {
              setOpenVariationsView(null);
       };
       const handleCloseExcludesView = () => {
              setOpenExcludesView(null);
       };
       const handleCloseExtraView = () => {
              setOpenExtraView(null);
       };
       useEffect(
              () => {
                     refetchProducts()
              }, [refetchProducts]
       )

       const handleOpenDelete = (item) => {
              setOpenDelete(item);
       };
       const handleCloseDelete = () => {
              setOpenDelete(null);
       };

       // Delete Product
       const handleDelete = async (id, name) => {
              const success = await deleteData(`${apiUrl}/admin/product/delete/${id}`, `${name} Deleted Success.`);

              if (success) {
                     setProducts(
                            products.filter((product) =>
                                   product.id !== id
                            )
                     );
              }
              console.log('products', products)
       };
       // Function to flatten product data and export to Excel
       const exportProductsToExcel = () => {
              // Filter products based on:
              // - At most 2 variations.
              // - Each variation must have at most 3 options.
              // - If extra or excludes arrays exist, their lengths must be <= 5.
              const filteredProducts = products.filter(product => {
                const variations = product.variations || [];
                if (variations.length > 2) return false;
                for (const variation of variations) {
                  const options = variation.options || [];
                  if (options.length > 3) return false;
                }
                if (product.extra && product.extra.length > 5) return false;
                if (product.excludes && product.excludes.length > 5) return false;
                return true;
              });
          
              // Map each product to a flat object with base fields and variation data only.
              const data = filteredProducts.map(product => {
                const row = {
                     id: product.id,
                     name: product.name,
                     description:product.description,
                     item_type: product.item_type,
                     stock_type: product.stock_type,
                     number: product.number,
                     price: product.price || 0,
                     product_time_status: product.product_time_status,
                     from: product.from,
                     to: product.to,
                     points: product.points || 0,
                };
          
                // Process Variation 1 (if available)
                if (product.variations && product.variations.length > 0) {
                  const var1 = product.variations[0] || {};
                  row['variations1_id'] = var1.id || '';
                  row['variations1_name'] = var1.name || '';
                  row['variations1_type'] = var1.type || '';
                  row['variations1_min'] = var1.min || '';
                  row['variations1_max'] = var1.max || '';
                  row['variations1_required'] = var1.required || '';
          
                  if (var1.options && var1.options.length > 0) {
                    const option1 = var1.options[0] || {};
                    row['variations1_option1_id'] = option1.id || '';
                    row['variations1_option1_name'] = option1.name || '';
                    row['variations1_option1_price'] = option1.price || 0;
                    row['variations1_option1_status'] = option1.status || '';
                    row['variations1_option1_points'] = option1.points || 0;
          
                    const option2 = var1.options[1] || {};
                    row['variations1_option2_id'] = option2.id || '';
                    row['variations1_option2_name'] = option2.name || '';
                    row['variations1_option2_price'] = option2.price || 0;
                    row['variations1_option2_status'] = option2.status || '';
                    row['variations1_option2_points'] = option2.points || 0;
          
                    const option3 = var1.options[2] || {};
                    row['variations1_option3_id'] = option3.id || '';
                    row['variations1_option3_name'] = option3.name || '';
                    row['variations1_option3_price'] = option3.price || 0;
                    row['variations1_option3_status'] = option3.status || '';
                    row['variations1_option3_points'] = option3.points || 0;
                  }
                }
          
                // Process Variation 2 (if available)
                if (product.variations && product.variations.length > 1) {
                  const var2 = product.variations[1] || {};
                  row['variations2_id'] = var2.id || '';
                  row['variations2_name'] = var2.name || '';
                  row['variations2_type'] = var2.type || '';
                  row['variations2_min'] = var2.min || '';
                  row['variations2_max'] = var2.max || '';
                  row['variations2_required'] = var2.required || '';
          
                  if (var2.options && var2.options.length > 0) {
                    const option1 = var2.options[0] || {};
                    row['variations2_option1_id'] = option1.id || '';
                    row['variations2_option1_name'] = option1.name || '';
                    row['variations2_option1_price'] = option1.price || 0;
                    row['variations2_option1_status'] = option1.status || '';
                    row['variations2_option1_points'] = option1.points || 0;
          
                    const option2 = var2.options[1] || {};
                    row['variations2_option2_id'] = option2.id || '';
                    row['variations2_option2_name'] = option2.name || '';
                    row['variations2_option2_price'] = option2.price || 0;
                    row['variations2_option2_status'] = option2.status || '';
                    row['variations2_option2_points'] = option2.points || 0;
          
                    const option3 = var2.options[2] || {};
                    row['variations2_option3_id'] = option3.id || '';
                    row['variations2_option3_name'] = option3.name || '';
                    row['variations2_option3_price'] = option3.price || 0;
                    row['variations2_option3_status'] = option3.status || '';
                    row['variations2_option3_points'] = option3.points || 0;
                  }
                }
          
                return row;
              });
          
              // Create worksheet from the data
              const worksheet = XLSX.utils.json_to_sheet(data);
              const workbook = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');             
          
              XLSX.writeFile(workbook, 'products.xlsx');
       };
       // When a file is selected, store it in state.
       const handleFileUpload = (e) => {
              const file = e.target.files[0];
              if (file) {
              setSelectedFile(file);
              }
       };
       
       // Submit the file via your API.
       const handleSubmitFile = () => {
              if (selectedFile) {
              const formData = new FormData();
              formData.append("file", selectedFile);
              // postFile is assumed to be your function for posting file data.
              postData(formData,"File Uploaded Success");
              }
       };
       
       const headers = [
              '#',
              'Name',
              'Image',
              'Price',
              'Description',
              "Category",
              'Subcategory',
              'Addons',
              'Variations',
              'Discount',
              'Tax',
              'Excludes',
              'Extra',
              'Item Type',
              'Number',
              'Points',
              'Stock Type',
              'From',
              'To',
              'Action'
       ];
       return (
              <>
                     <div className="w-full pb-28 flex items-start justify-start">
                            {loadingProducts || loadingDelete || loadingPost ? (
                                   <><LoaderLogin /></>
                            ) : (
                                   <div className='w-full flex flex-col'>
                                          <div className='w-full flex flex-col md:flex-row justify-between mb-5 gap-3'>
                                                 <div className="sm:w-full md:w-[30%]">
                                                 <SearchBar
                                                        placeholder='Search by Product Name'
                                                        value={textSearch}
                                                        handleChange={handleFilterData}
                                                 />
                                                 </div>
                                                 <div className="flex flex-col md:flex-row gap-3">
                                                         {/* Download Button */}
                                                        <button
                                                               className="bg-mainColor text-white font-semibold py-2 px-6 rounded flex items-center gap-2"
                                                               onClick={exportProductsToExcel}
                                                        >
                                                               <FaDownload size={16} />
                                                               Download Excel
                                                        </button>
                                                        {/* Upload Button */}
                                                        <label className="cursor-pointer text-center inline-block bg-mainColor text-white font-semibold py-2 px-4 rounded flex items-center gap-2">
                                                               <FaUpload size={16} />
                                                               {selectedFile ? selectedFile.name : "Upload"}
                                                               <input
                                                               type="file"
                                                               className="hidden"
                                                               onChange={handleFileUpload}
                                                               />
                                                        </label>
                                                        {/* Show Submit Button only if a file is selected */}
                                                        {selectedFile && (
                                                               <button
                                                               className="bg-white text-mainColor border border-mainColor font-semibold py-2 px-2 rounded-2xl flex items-center gap-2 hover:bg-mainColor hover:text-white transition duration-300"
                                                               onClick={handleSubmitFile}
                                                        >
                                                               Submit File
                                                        </button>      
                                                        )}
                                                        </div>
                                          </div>

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
                                                        {filteredProducts.length === 0 ? (
                                                               <tr>
                                                                      <td colSpan={12} className='text-center text-xl text-mainColor font-TextFontMedium  '>Not find products</td>
                                                               </tr>
                                                        ) : (


                                                               currentProducts.map((product, index) => ( // Example with two rows
                                                                      <tr className="w-full border-b-2" key={index}>
                                                                             <td className="min-w-[80px] sm:min-w-[50px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                                                    {(currentPage - 1) * productsPerPage + index + 1}
                                                                             </td>
                                                                             <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                                                    {product?.name || '-'}
                                                                             </td>
                                                                             <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 overflow-hidden">
                                                                                    <div className="flex justify-center">
                                                                                           <img src={product.image_link}
                                                                                                  className="bg-mainColor rounded-full min-w-14 min-h-14 max-w-14 max-h-14"
                                                                                                  alt="Photo"
                                                                                           />
                                                                                    </div>
                                                                             </td>
                                                                             <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                                                    {product?.price || '-'}
                                                                             </td>
                                                                             <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12  py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                                                    {/* <p className='h-4'>{product?.description || '-'}</p> */}
                                                                                    <span className='text-mainColor text-xl border-b-2 border-mainColor font-TextFontSemiBold cursor-pointer'
                                                                                           onClick={() => handleOpenDescriptionView(product.id)}>
                                                                                           View
                                                                                    </span>
                                                                             </td>
                                                                             <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                                                    {product.category?.name || '-'}
                                                                             </td>
                                                                             <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                                                    {product.sub_category?.name || '-'}
                                                                             </td>
                                                                             <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                                                    <span className='text-mainColor text-xl border-b-2 border-mainColor font-TextFontSemiBold cursor-pointer'
                                                                                           onClick={() => handleOpenAddonsView(product.id)}>
                                                                                           View
                                                                                    </span>
                                                                             </td>

                                                                             <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                                                    <span className='text-mainColor text-xl border-b-2 border-mainColor font-TextFontSemiBold cursor-pointer'
                                                                                           onClick={() => handleOpenVariationsView(product.id)}>
                                                                                           View
                                                                                    </span>
                                                                             </td>
                                                                             <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                                                    {product.discount?.name || '-'}
                                                                             </td>
                                                                             <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                                                    {product.tax?.name || '-'}
                                                                             </td>
                                                                             <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                                                    <span className='text-mainColor text-xl border-b-2 border-mainColor font-TextFontSemiBold cursor-pointer'
                                                                                           onClick={() => handleOpenExcludesView(product.id)}>
                                                                                           View
                                                                                    </span>
                                                                             </td>
                                                                             <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                                                    <span className='text-mainColor text-xl border-b-2 border-mainColor font-TextFontSemiBold cursor-pointer'
                                                                                           onClick={() => handleOpenExtraView(product.id)}>
                                                                                           View
                                                                                    </span>
                                                                             </td>
                                                                             <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                                                    {product?.item_type || '-'}
                                                                             </td>
                                                                             <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                                                    {product?.number || '-'}
                                                                             </td>
                                                                             <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                                                    {product?.points || '-'}
                                                                             </td>
                                                                             <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                                                    {product?.stock_type || '-'}
                                                                             </td>
                                                                             <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                                                    {product?.from || '-'}
                                                                             </td>
                                                                             <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                                                    {product?.to || '-'}
                                                                             </td>
                                                                             <td className="px-4 py-3 text-center">
                                                                                    <div className="flex items-center justify-center gap-2">
                                                                                           <Link to={`edit/${product.id}`}  ><EditIcon /></Link>

                                                                                           <button
                                                                                                  type="button"
                                                                                                  onClick={() => handleOpenDelete(product.id)}
                                                                                           >
                                                                                                  <DeleteIcon />
                                                                                           </button>
                                                                                           {openDelete === product.id && (
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
                                                                                                                                                   You will delete product {product?.name || "-"}
                                                                                                                                            </div>
                                                                                                                                     </div>
                                                                                                                              </div>
                                                                                                                              <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                                                                                                                     <button className="inline-flex w-full justify-center rounded-md bg-mainColor px-6 py-3 text-sm font-TextFontSemiBold text-white shadow-sm sm:ml-3 sm:w-auto" onClick={() => handleDelete(product.id, product.name)}>
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


                                                                                           {openDescriptionView === product.id && (
                                                                                                  <Dialog open={true} onClose={handleCloseDescriptionView} className="relative z-10">
                                                                                                         <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                                                                                                         <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                                                                                                                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                                                                                                       <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">

                                                                                                                              {/* Permissions List */}
                                                                                                                              <div className="w-full flex flex-wrap items-center justify-center gap-4 my-4 px-4 sm:p-6 sm:pb-4">

                                                                                                                                     <ul className=' p-4 rounded-xl shadow-md'>
                                                                                                                                            <li className="list-disc mx-4 text-mainColor text-lg lg:text-xl font-TextFontSemiBold capitalize">
                                                                                                                                                   {product?.description}
                                                                                                                                            </li>
                                                                                                                                     </ul>

                                                                                                                              </div>

                                                                                                                              {/* Dialog Footer */}
                                                                                                                              <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                                                                                                                     <button
                                                                                                                                            type="button"
                                                                                                                                            onClick={handleCloseDescriptionView}
                                                                                                                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-mainColor px-6 py-3 text-sm font-TextFontMedium text-white shadow-sm sm:mt-0 sm:w-auto hover:bg-mainColor-dark focus:outline-none"
                                                                                                                                     >
                                                                                                                                            Close
                                                                                                                                     </button>
                                                                                                                              </div>

                                                                                                                       </DialogPanel>
                                                                                                                </div>
                                                                                                         </div>
                                                                                                  </Dialog>
                                                                                           )}

                                                                                           {openAddonsView === product.id && (
                                                                                                  <Dialog open={true} onClose={handleCloseAddonsView} className="relative z-10">
                                                                                                         <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                                                                                                         <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                                                                                                                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                                                                                                       <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">

                                                                                                                              {/* Permissions List */}
                                                                                                                              <div className="w-full flex flex-wrap items-center justify-center gap-4 my-4 px-4 sm:p-6 sm:pb-4">
                                                                                                                                     {product.addons.length === 0 ? (
                                                                                                                                            <div className="w-full text-center text-lg font-TextFontSemiBold text-gray-500 my-4">
                                                                                                                                                   No Addons available for this product.
                                                                                                                                            </div>
                                                                                                                                     ) : (
                                                                                                                                            product.addons.map((addon, index) => {
                                                                                                                                                   const displayIndex = index + 1;
                                                                                                                                                   return (
                                                                                                                                                          <div
                                                                                                                                                                 key={index}
                                                                                                                                                                 className="sm:w-full lg:w-5/12 xl:w-3/12 flex items-center justify-center shadow-md hover:shadow-none duration-300 py-3 px-4 rounded-xl bg-gray-50"
                                                                                                                                                          >
                                                                                                                                                                 <span className="text-mainColor text-lg lg:text-xl font-TextFontSemiBold capitalize">
                                                                                                                                                                        {displayIndex}. {addon.name}
                                                                                                                                                                 </span>
                                                                                                                                                          </div>
                                                                                                                                                   );
                                                                                                                                            })
                                                                                                                                     )}

                                                                                                                              </div>

                                                                                                                              {/* Dialog Footer */}
                                                                                                                              <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                                                                                                                     <button
                                                                                                                                            type="button"
                                                                                                                                            onClick={handleCloseAddonsView}
                                                                                                                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-mainColor px-6 py-3 text-sm font-TextFontMedium text-white shadow-sm sm:mt-0 sm:w-auto hover:bg-mainColor-dark focus:outline-none"
                                                                                                                                     >
                                                                                                                                            Close
                                                                                                                                     </button>
                                                                                                                              </div>

                                                                                                                       </DialogPanel>
                                                                                                                </div>
                                                                                                         </div>
                                                                                                  </Dialog>
                                                                                           )}

                                                                                           {openVariationsView === product.id && (
                                                                                                  <Dialog open={true} onClose={handleCloseVariationsView} className="relative z-10">
                                                                                                         <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                                                                                                         <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                                                                                                                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                                                                                                       <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">

                                                                                                                              {/* Permissions List */}
                                                                                                                              <div className="w-full flex flex-col items-start justify-start gap-4 my-4 px-4 sm:p-6 sm:pb-4">
                                                                                                                                     {product.variations.length === 0 ? (
                                                                                                                                            <div className="w-full text-center text-lg font-TextFontSemiBold text-gray-500 my-4">
                                                                                                                                                   No Variations available for this product.
                                                                                                                                            </div>
                                                                                                                                     ) : (
                                                                                                                                            product.variations.map((variation, index) => {
                                                                                                                                                   const displayIndex = index + 1;
                                                                                                                                                   return (
                                                                                                                                                          <>
                                                                                                                                                                 <div
                                                                                                                                                                        key={index}
                                                                                                                                                                        className="sm:w-full lg:w-auto flex items-start justify-start shadow-md p-2 rounded-xl bg-mainColor "
                                                                                                                                                                 >
                                                                                                                                                                        <div className="w-full flex flex-col items-start justify-start gap-3">

                                                                                                                                                                               <span className="text-white text-lg lg:text-xl font-TextFontSemiBold capitalize">
                                                                                                                                                                                      {displayIndex}. {variation.name}
                                                                                                                                                                               </span>
                                                                                                                                                                        </div>
                                                                                                                                                                 </div>
                                                                                                                                                                 {variation.options.map((option, indexOption) => {
                                                                                                                                                                        return (<div className="w-full flex flex-wrap items-start justify-start gap-5" key={`${option.id}-${indexOption}`}>
                                                                                                                                                                               <div className="">
                                                                                                                                                                                      <span>option Name: {option.name}</span>
                                                                                                                                                                               </div>
                                                                                                                                                                               <div className="">
                                                                                                                                                                                      <span>option Price: {option.price}</span>
                                                                                                                                                                               </div>
                                                                                                                                                                               <div className="">
                                                                                                                                                                                      <span>option points: {option.points}</span>
                                                                                                                                                                               </div>
                                                                                                                                                                        </div>)
                                                                                                                                                                 })}
                                                                                                                                                          </>
                                                                                                                                                   );
                                                                                                                                            })
                                                                                                                                     )}

                                                                                                                              </div>

                                                                                                                              {/* Dialog Footer */}
                                                                                                                              <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                                                                                                                     <button
                                                                                                                                            type="button"
                                                                                                                                            onClick={handleCloseVariationsView}
                                                                                                                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-mainColor px-6 py-3 text-sm font-TextFontMedium text-white shadow-sm sm:mt-0 sm:w-auto hover:bg-mainColor-dark focus:outline-none"
                                                                                                                                     >
                                                                                                                                            Close
                                                                                                                                     </button>
                                                                                                                              </div>

                                                                                                                       </DialogPanel>
                                                                                                                </div>
                                                                                                         </div>
                                                                                                  </Dialog>
                                                                                           )}

                                                                                           {openExcludesView === product.id && (
                                                                                                  <Dialog open={true} onClose={handleCloseExcludesView} className="relative z-10">
                                                                                                         <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                                                                                                         <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                                                                                                                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                                                                                                       <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">

                                                                                                                              {/* Permissions List */}
                                                                                                                              <div className="w-full flex flex-wrap items-center justify-center gap-4 my-4 px-4 sm:p-6 sm:pb-4">
                                                                                                                                     {product.excludes.length === 0 ? (
                                                                                                                                            <div className="w-full text-center text-lg font-TextFontSemiBold text-gray-500 my-4">
                                                                                                                                                   No Excludes available for this product.
                                                                                                                                            </div>
                                                                                                                                     ) : (
                                                                                                                                            product.excludes.map((exclude, index) => {
                                                                                                                                                   const displayIndex = index + 1;
                                                                                                                                                   return (
                                                                                                                                                          <div
                                                                                                                                                                 key={index}
                                                                                                                                                                 className="sm:w-full lg:w-5/12 xl:w-3/12 flex items-center justify-center shadow-md hover:shadow-none duration-300 py-3 px-4 rounded-xl bg-gray-50"
                                                                                                                                                          >
                                                                                                                                                                 <span className="text-mainColor text-lg lg:text-xl font-TextFontSemiBold capitalize">
                                                                                                                                                                        {displayIndex}. {exclude.name}
                                                                                                                                                                 </span>
                                                                                                                                                          </div>
                                                                                                                                                   );
                                                                                                                                            })
                                                                                                                                     )}

                                                                                                                              </div>

                                                                                                                              {/* Dialog Footer */}
                                                                                                                              <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                                                                                                                     <button
                                                                                                                                            type="button"
                                                                                                                                            onClick={handleCloseExcludesView}
                                                                                                                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-mainColor px-6 py-3 text-sm font-TextFontMedium text-white shadow-sm sm:mt-0 sm:w-auto hover:bg-mainColor-dark focus:outline-none"
                                                                                                                                     >
                                                                                                                                            Close
                                                                                                                                     </button>
                                                                                                                              </div>

                                                                                                                       </DialogPanel>
                                                                                                                </div>
                                                                                                         </div>
                                                                                                  </Dialog>
                                                                                           )}

                                                                                           {openExtraView === product.id && (
                                                                                                  <Dialog open={true} onClose={handleCloseExtraView} className="relative z-10">
                                                                                                         <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                                                                                                         <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                                                                                                                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                                                                                                       <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">

                                                                                                                              {/* Permissions List */}
                                                                                                                              <div className="w-full flex flex-wrap items-center justify-center gap-4 my-4 px-4 sm:p-6 sm:pb-4">
                                                                                                                                     {product.extra.length === 0 ? (
                                                                                                                                            <div className="w-full text-center text-lg font-TextFontSemiBold text-gray-500 my-4">
                                                                                                                                                   No extra available for this product.
                                                                                                                                            </div>
                                                                                                                                     ) : (
                                                                                                                                            product.extra.map((ext, index) => {
                                                                                                                                                   const displayIndex = index + 1;
                                                                                                                                                   return (
                                                                                                                                                          <div
                                                                                                                                                                 key={index}
                                                                                                                                                                 className="sm:w-full lg:w-5/12 xl:w-3/12 flex items-center justify-center shadow-md hover:shadow-none duration-300 py-3 px-4 rounded-xl bg-gray-50"
                                                                                                                                                          >
                                                                                                                                                                 <span className="text-mainColor text-lg lg:text-xl font-TextFontSemiBold capitalize">
                                                                                                                                                                        {displayIndex}. {ext.name}
                                                                                                                                                                 </span>
                                                                                                                                                          </div>
                                                                                                                                                   );
                                                                                                                                            })
                                                                                                                                     )}

                                                                                                                              </div>

                                                                                                                              {/* Dialog Footer */}
                                                                                                                              <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                                                                                                                     <button
                                                                                                                                            type="button"
                                                                                                                                            onClick={handleCloseExtraView}
                                                                                                                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-mainColor px-6 py-3 text-sm font-TextFontMedium text-white shadow-sm sm:mt-0 sm:w-auto hover:bg-mainColor-dark focus:outline-none"
                                                                                                                                     >
                                                                                                                                            Close
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

                                          {filteredProducts.length > 0 && (
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
              </>
       );
}

export default ProductPage