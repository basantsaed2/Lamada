import React, { useState } from 'react'
import { AddMenuPage, MenuPage } from '../../../../Pages/Pages'
import { TitlePage, TitleSection } from '../../../../Components/Components'

const MenuLayout = () => {
       const [update, setUpdate] = useState(false)
       return (
              <>
                     <TitlePage text={'Add Menu'} />
                     <AddMenuPage update={update} setUpdate={setUpdate}/>
                     <TitleSection text={'Menu Table'} />
                     <MenuPage refetch={update}/>
              </>
       )
}

export default MenuLayout