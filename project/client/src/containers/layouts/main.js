import React from 'react'
import Nav from '../../components/common/header'


function Main ({ children }) {

    console.log('render Main')

    return (
        <div>
            <Nav />
            {children}
        </div>
    )
}

export default Main;
