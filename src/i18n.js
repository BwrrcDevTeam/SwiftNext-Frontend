// 本地化模块

function get_lang() {
    if (typeof(Storage) !== "undefined") {
        // Code for localStorage/sessionStorage.
        if (localStorage.getItem("lang") === null) {
            localStorage.setItem("lang", "cn");
        }
        return localStorage.getItem("lang");
    } else {
        // Sorry! No Web Storage support..
        return "cn";
    }
}

function translate(mapping) {
    // mapping是一个对象，key是语言，value是对应的翻译
    let lang = get_lang();
    if (mapping[lang] === undefined) {
        // 默认语言是中文
        lang = "cn";
    }
    // 返回对应翻译
    return mapping[lang];
}

const Modal_strings = {
    contact_modal_title: {
        cn: '联系管理员',
        en: 'Contact Admin'
    },
    contact_modal_line1: {
        cn: "我的联系信息:",
        en: "My contact information:"
    },
    contact_modal_line2: {
        cn: "微信: lihe1300407",
        en: "WeChat: lihe1300407"
    },
    contact_modal_line3: {
        cn: "邮箱: li@imlihe.com",
        en: "Email: li@imlihe.com"
    },
    contact_modal_line4: {
        cn: "别忘了附上详细错误信息",
        en: "Don't forget to attach the detailed error information"
    },
    contact_modal_footer: {
        cn: "又要加班了",
        en: "I LOVE debugging"
    },
}

const Content_strings = {
    welcome_title: {
        cn: "欢迎 ( ＾∀＾）／",
        en: "Welcome ( ＾∀＾）／"
    },
    welcome_subtitle: {
        cn: "请登录或注册吧!",
        en: "Please login or register!"
    },
    need_login: {
        cn: "先登录吧 (°ー°〃) ",
        en: "Please login first (°ー°〃) "
    },
    need_login_subtitle: {
        cn: "该操作需要登录！",
        en: "This operation requires login!"
    }
}

const Error_strings = {
    reload: {
        cn: "重开罢",
        en: "Reload"
    }
}

const Login_strings = {
    continue: {
        cn: "继续",
        en: "Continue"
    },
    wechat_login: {
        cn: "微信登录",
        en: "WeChat Login"
    },
    no_such_email: {
        title: {
            cn: "用户不存在 Σ( ° △ °|||)︴",
            en: "User doesn't exist Σ( ° △ °|||)︴"
        },
        description: {
            cn: "这个邮箱没有被注册过! 请检查邮箱是否填写正确",
            en: "This email hasn't been registered yet! Please check the email is correct"
        }
    },
    login: {
        cn: "登录",
        en: "Login"
    },
    password_length_error: {
        title: {
            cn: "密码长度错误 Σ( ° △ °|||)︴",
            en: "Password length error Σ( ° △ °|||)︴"
        },
        description: {
            cn: "密码长度必须在6-20位之间",
            en: "Password length must be between 6-20"
        }
    }
}

const Declaration_strings = {
    privacy: {
        cn: "隐私政策",
        en: "Privacy Policy"
    },
    privacy_line1: {
        cn: "本网站使用 Cookie，以提供更好的用户体验。本网站仅使用Cookie记录客户端当前登录的用户账号，并不会用于跟踪用户或是收集任何用户信息。",
        en: "This website uses cookies to provide a better user experience. This website only uses cookies to " +
            "record the user account currently logged in by the client, and will not be used to track users " +
            "or collect any user information."
    },
    privacy_line2: {
        cn: "本网站设置的的全部Cookie均启用了Secure属性，确保用户的隐私不会被恶意脚本窃取。一切Cookie均可以通过浏览器设置进行控制，" +
            "服务器对全部Cookie的控制权限仅限于本网站。",
        en: "All cookies set by this website are enabled with the Secure attribute to ensure that users' privacy will " +
            "not be stolen by malicious scripts. All cookies can be controlled through browser settings, and the " +
            "server's control over all cookies is limited to this website."
    },
    privacy_line3: {
        cn: "本网站不会主动收集任何重要用户数据（如用户付款信息，生物识别信息，身份信息等）。但是，本网站会为确保网站服务的安全性，" +
            "收集客户端的软件版本信息，IP地址及相关请求头。这些网络信息在必要时会与用户账号相关联。",
        en: "This website does not actively collect any important user data (such as user payment information, " +
            "biometric information, identity information, etc.). However, this website will collect the client's " +
            "software version information, IP address and related request headers in order to ensure the security of " +
            "the website service. This network information is associated with user accounts when necessary."
    },
    privacy_line4: {
        cn: "针对用户自愿上传的数据（如用户头像，姓名，调查点地理位置等），本站不会主动将其披露给访客。但当用户数据涉及到违法违规内容时，" +
            "本站有责任义务对其进行合规性审查。审查不限于基于机器学习的内容识别和人工安全审计，必要时本站会对违法违规数据进行删除。",
        en: "For data voluntarily uploaded by users (such as user avatar, name, geographic location of survey points," +
            " etc.), this site will not actively disclose it to visitors. However, when user data involves illegal" +
            " content, this site has the responsibility and obligation to conduct compliance review. The review is not " +
            "limited to content identification and manual security audit based on machine learning, and this site will" +
            " delete illegal data when necessary."
    },
    about: {
        cn: "关于本站",
        en: "About this website"
    },
    about_line1: {
        cn: "本站是在北京野生动物保护中心授权监督下，由@lihe07独立开发的信息收集统计系统。系统包含一套面向用户的界面和一个用于处理数据交互的程序。",
        en: "This site is an information collection and statistics system independently developed by @lihe07 under the " +
            "authorization and supervision of Beijing Wildlife Conservation Center. The system consists of a " +
            "user-oriented interface and a program for handling data interactions."
    },
    about_line2: {
        cn: "本站的主要功能包括：",
        en: "The main functions of this system include:"
    },
    about_functions: [
        {
            cn: "用户友好的数据记录及上传模块",
            en: "User-friendly data logging and uploading module"
        },
        {
            cn: "基于深度学习的图片自动计数模块（同时支持人工修改验证）",
            en: "Image automatic counting module based on deep learning (also supports manual modification and verification)"
        },
        {
            cn: "便捷的社区交流合作功能",
            en: "Convenient community communication and cooperation functions"
        },
        {
            cn: "直观的统计数据展示功能",
            en: "Intuitive statistics display function"
        }
    ]
}

const Header_strings = {
    menu: {
        home: {
            cn: "控制台",
            en: "Dashboard"
        },
        community: {
            cn: "社区",
            en: "Community"
        },
    }
}

const Register_strings = {

}

export {
    translate,
    get_lang,
    Modal_strings,
    Error_strings,
    Login_strings,
    Content_strings,
    Declaration_strings,
    Header_strings
};
