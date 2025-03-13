import React, { useEffect, useState } from 'react'
import { useGet } from '../../../../../Hooks/useGet';
import { usePost } from '../../../../../Hooks/usePostJson';
import { LoaderLogin, SubmitButton, TextInput, TimeInput } from '../../../../../Components/Components';
import classNames from 'classnames';

const CancelTimePage = () => {
       const apiUrl = import.meta.env.VITE_API_BASE_URL;
       const { refetch: refetchCancelTime, loading: loadingCancelTime, data: dataCancelTime } = useGet({
              url: `${apiUrl}/admin/settings/view_time_cancel`
       });
       const { postData, loadingPost, response } = usePost({ url: `${apiUrl}/admin/settings/update_time_cancel` });

       const [cancelTime, setCancelTime] = useState('');


       useEffect(() => {
              refetchCancelTime();
       }, [refetchCancelTime]);

       useEffect(() => {
              if (dataCancelTime && dataCancelTime.time) {
                     setCancelTime(dataCancelTime.time.setting || '');
              }
       }, [dataCancelTime]); // Only run this effect when `data` changes

       const handleCancelTimeChange = (event) => {
              let value = event.target.value.replace(/[^0-9:]/g, ""); // Allow only numbers and ':'
            
              // Ensure there's at most one colon
              if (value.includes(":")) {
                const [hours, minutes] = value.split(":");
            
                // Limit input to HH:MM format
                if (hours.length > 2) value = `${hours.slice(0, 2)}:${minutes}`;
                if (minutes && minutes.length > 2) value = `${hours}:${minutes.slice(0, 2)}`;
              } else {
                // Automatically insert colon when typing the third digit
                if (value.length > 2) value = `${value.slice(0, 2)}:${value.slice(2, 4)}`;
              }
            
              setCancelTime(value);
            };
            

       const handleChangeCancelTime = (e) => {
              e.preventDefault();

              if (!cancelTime) {
                     auth.toastError('please Enter Cancel Time')
                     return;
              }

              const formData = new FormData();

              formData.append("time", cancelTime);


              console.log(...formData.entries());
              postData(formData, "Cancel Time Changed Success")
       };
       return (
              <>
                     {loadingPost || loadingCancelTime ? (
                            <>
                                   <div className="w-full flex justify-center items-center">
                                          <LoaderLogin />
                                   </div>
                            </>
                     ) : (
                            <section>
                                   <form onSubmit={handleChangeCancelTime}>

                                          <div className="w-full flex sm:flex-col lg:flex-row flex-wrap items-center justify-start gap-4 mb-4">
                                                 {/* Tax Types */}
                                                 <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                                                        <span className="text-xl font-TextFontRegular text-thirdColor">Time:</span>
                                                        {/* <TimeInput
                                                               value={cancelTime}
                                                               onChange={(e) => setCancelTime(e.target.value)}
                                                               placeholder={'Cancel Time'}
                                                        /> */}
                                                        <input
                                                        type="text"
                                                        name="cancelTime"
                                                        value={cancelTime}
                                                        onChange={handleCancelTimeChange}
                                                        placeholder="HH:MM"
                                                        inputMode="numeric"
                                                        maxLength="5"
                                                        className={classNames(
                                                        'w-full border-2 rounded-2xl outline-none px-2 py-3 shadow text-2xl text-thirdColor border-mainColor'
                                                        )}
                                                        />
                                                 </div>
                                          </div>

                                          {/* Buttons*/}
                                          <div className="w-full flex items-center justify-end gap-x-4">
                                                 <div className="">
                                                        <SubmitButton
                                                               text={'Change'}
                                                               rounded='rounded-full'
                                                               handleClick={handleChangeCancelTime}
                                                        />
                                                 </div>

                                          </div>
                                   </form>
                            </section>
                     )}
              </>
       )
}

export default CancelTimePage