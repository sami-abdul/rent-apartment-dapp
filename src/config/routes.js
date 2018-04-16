import React from 'react';
import { connect } from 'react-redux';
import {
  Router,
  Route
} from 'react-router-dom';
import CustomNavbar from '../components/navbar'
import Signin from '../components/signin'
import Signup from '../components/signup';
import Landlord from '../components/landlord';
import Tenant from '../components/tenant';
import Admin from '../components/admin';

import history from '../history';

const BasicRouting = (props) => {
  return ( 
    <Router history={history}>
    <div>
        <CustomNavbar />
        {
          (!(props.isLogin)) ? 
          (
            <div>
            <Route exact path="/" component={Signin} />
            <Route path="/signup" component={Signup} />
            </div>
          ) :
          (
            <div>
              {(props.type === 'Landlord')? 
              ( <Route path="/landlord" component={Landlord} /> ) : 
              ( null ) 
            }
            {(props.type === 'Tenant')? 
              ( <Route path="/tenant" component={Tenant} /> ) : 
              ( null ) 
            }
            {/* {(props.type === 'Admin')? 
              ( <Route path="/admin" component={Admin} /> ) : 
              ( null ) 
            } */}
            </div>
          )
        }
        </div>
    </Router>
  )
}

function mapStateToProp(state) {
  return ({
    isLogin : state.root.isLogin,
    type : state.root.type
  })
}

export default connect(mapStateToProp, null)(BasicRouting);
// import React from 'react';
// import { connect } from 'react-redux';
// import {
//   Router,
//   Route
// } from 'react-router-dom';
// import CustomNavbar from '../components/navbar'
// import Signin from '../components/signin'
// import Signup from '../components/signup';
// import Home from '../components/home';
// import history from '../history';

// const BasicRouting = (props) => {
//   return ( 
//     <Router history={history}>
//     <div>
//         <CustomNavbar />
//         {
//           (!(props.isLogin)) ? 
//           (
//             <div>
//             <Route exact path="/" component={Signup} />
//             <Route path="/signin" component={Signin} />
//             </div>
//           ) :
//           (
//             <div>
//             <Route path="/home" component={Home} />
//             </div>
//           )
//         }
//         </div>
//     </Router>
//   )
// }

// function mapStateToProp(state) {
//   return ({
//     isLogin : state.root.isLogin
//   })
// }

// export default connect(mapStateToProp, null)(BasicRouting);