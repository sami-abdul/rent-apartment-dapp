const INITIAL_STATE = {
    user: {},
    allUserProfile: [],
    allCompanyProfile: [],
    userID: '',
    type: '',
    isLogin: false,
    progressBarDisplay: false,
    errorMessage: ''
}

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'USER':
            {
//                console.log(action.payload)
            }
            return ({
                ...state,
                user: action.payload
            })
        case 'CURRENT_USER_UID':
            return ({
                ...state,
                userID: action.payload
            })
        case 'IS_LOGIN':
            return ({
                ...state,
                isLogin: action.payload
            })
        case 'SHOW_PROGRESS_BAR':
            return ({
                ...state,
                progressBarDisplay: action.payload
            })
        case 'ERROR_MESSAGE':
            return ({
                ...state,
                errorMessage: action.payload
            })
        case 'TYPE':
            {
//                console.log(action.payload)
            }
            return ({
              ...state,
                type: action.payload
            })
        case 'ALL_USERS_PROFILE':
            { console.log(action.payload) }
            return ({
            ...state,
                allUserProfile: action.payload
            })
            case 'ALL_COMPANY_PROFILE':
            { console.log(action.payload) }
            return ({
              ...state,
                allCompanyProfile: action.payload
            })
        default:
            return state;
    }

}