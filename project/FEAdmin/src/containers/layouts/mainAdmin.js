import React from 'react'
import Nav from '../../components/common/header'


function MainAdmin ({children}) {

    console.log('render Main Admin')

    return (
        <div>
            <Nav />
            {children}
        </div>
    )
}

export default MainAdmin;
