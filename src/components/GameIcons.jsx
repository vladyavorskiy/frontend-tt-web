import React from "react";

// Трофей маленький
export const TrophyIcon = ({ width = 16, height = 16, color = "white", className = "" }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 20 20" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g clipPath="url(#trophy-clip)">
      <path 
        d="M14.9998 4.21833V2.5H4.99984V4.21833H1.6665V6.66667C1.6665 8.77083 3.2415 10.4983 5.26984 10.7767C5.85317 12.4917 7.34067 13.785 9.1665 14.0917V15C9.1665 15.9208 8.42067 16.6667 7.49984 16.6667H6.6665V18.3333H13.3332V16.6667H12.4998C11.579 16.6667 10.8332 15.9208 10.8332 15V14.0917C12.6582 13.785 14.1465 12.4917 14.7298 10.7767C16.7582 10.4983 18.3332 8.77083 18.3332 6.66667V4.21833H14.9998ZM3.33317 6.66667V5.885H4.99984V9.02333C4.02984 8.68 3.33317 7.75333 3.33317 6.66667ZM16.6665 6.66667C16.6665 7.75333 15.9698 8.68 14.9998 9.025V5.88333H16.6665V6.66667Z" 
        fill={color} 
      />
    </g>
    <defs>
      <clipPath id="trophy-clip">
        <rect width="20" height="20" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

// Трофей большой
export const TrophyLargeIcon = ({ width = 48, height = 48, color = "white", className = "" }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 20 20" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g clipPath="url(#trophy-large-clip)">
      <path 
        d="M14.9998 4.21833V2.5H4.99984V4.21833H1.6665V6.66667C1.6665 8.77083 3.2415 10.4983 5.26984 10.7767C5.85317 12.4917 7.34067 13.785 9.1665 14.0917V15C9.1665 15.9208 8.42067 16.6667 7.49984 16.6667H6.6665V18.3333H13.3332V16.6667H12.4998C11.579 16.6667 10.8332 15.9208 10.8332 15V14.0917C12.6582 13.785 14.1465 12.4917 14.7298 10.7767C16.7582 10.4983 18.3332 8.77083 18.3332 6.66667V4.21833H14.9998ZM3.33317 6.66667V5.885H4.99984V9.02333C4.02984 8.68 3.33317 7.75333 3.33317 6.66667ZM16.6665 6.66667C16.6665 7.75333 15.9698 8.68 14.9998 9.025V5.88333H16.6665V6.66667Z" 
        fill={color} 
      />
    </g>
    <defs>
      <clipPath id="trophy-large-clip">
        <rect width="20" height="20" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

// Галочка
export const CheckIcon = ({ width = 24, height = 24, color = "white", className = "" }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 20 20" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M7.4783 15.6521C7.21743 15.6521 6.9783 15.5652 6.78265 15.3695L2.45656 11.0434C2.06526 10.6521 2.06526 10.0434 2.45656 9.65213C2.84787 9.26083 3.45656 9.26083 3.84787 9.65213L7.50004 13.2826L16.174 4.63039C16.5653 4.23909 17.174 4.23909 17.5653 4.63039C17.9566 5.0217 17.9566 5.63039 17.5653 6.0217L8.19569 15.3695C7.9783 15.5652 7.73917 15.6521 7.4783 15.6521Z"
      fill={color}
    />
  </svg>
);

// Стрелка вверх/вниз
export const ArrowUpIcon = ({ width = 14, height = 14, color = "currentColor", className = "" }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 14 14" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M2 9L7 4L12 9" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const ArrowDownIcon = ({ width = 14, height = 14, color = "currentColor", className = "" }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 14 14" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M2 5L7 10L12 5" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

// Стрелка вправо 
export const ArrowRightIcon = ({ width = 16, height = 16, color = "#9CA3AF", className = "" }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M3 8H13M13 8L9 4M13 8L9 12" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

//  Крестик 
export const CloseIcon = ({ width = 10, height = 10, color = "white", className = "" }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 10 10" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M1 1L9 9M9 1L1 9" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
  </svg>
);

// Домой
export const HomeIcon = ({ width = 20, height = 20, color = "black", className = "" }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 20 20" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g clipPath="url(#home-clip)">
      <path d="M16.9593 11.4603V19.2915H12.0437V14.3978H7.95619V19.2915H3.04053V11.4603L9.99994 6.01025L16.9593 11.4603Z" fill={color}/>
      <path d="M0 9.47957L10 1.52051L20 9.47957L18.8363 11.1625L10 4.12957L1.16367 11.1625L0 9.47957Z" fill={color}/>
      <path d="M17.1818 0.708496V5.80225L14.71 3.8335V0.708496H17.1818Z" fill={color}/>
    </g>
    <defs>
      <clipPath id="home-clip">
        <rect width="20" height="20" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

// Выход
export const LogoutIcon = ({ width = 20, height = 20, color = "black", className = "" }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 20 20" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M13.0435 13.1957V17.1739C13.0435 17.6522 12.6957 18.0435 12.2174 18.0435H0.869565C0.391304 18.0435 0 17.6522 0 17.1739V2.82611C0 2.34785 0.391304 1.95654 0.869565 1.95654H12.2174C12.6957 1.95654 13.0435 2.34785 13.0435 2.82611V6.80437C13.0435 7.28263 12.6522 7.67393 12.1739 7.67393C11.6957 7.67393 11.3043 7.28263 11.3043 6.80437V3.69567H1.73913V16.3044H11.3043V13.1957C11.3043 12.7174 11.6957 12.3261 12.1739 12.3261C12.6522 12.3261 13.0435 12.7174 13.0435 13.1957ZM19.7391 9.34785L16.3478 5.91306C16 5.56524 15.4565 5.56524 15.1087 5.91306C14.7609 6.26089 14.7609 6.80437 15.1087 7.1522L17.0435 9.10872L6.5 9.13046C6.02174 9.13046 5.63043 9.52176 5.63043 10C5.63043 10.4783 6.02174 10.8696 6.5 10.8696L17.0435 10.8478L15.1087 12.8044C14.7609 13.1522 14.7826 13.6957 15.1087 14.0435C15.2826 14.2174 15.5 14.3044 15.7174 14.3044C15.9348 14.3044 16.1739 14.2174 16.3261 14.0435L19.7391 10.6087C20.087 10.2392 20.087 9.69567 19.7391 9.34785Z" fill={color}/>
  </svg>
);

// Удалить 
export const DeleteIcon = ({ width = 20, height = 20, color = "white", className = "" }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 20 20" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M3.75003 18.4375C3.74815 18.6839 3.84407 18.9209 4.01673 19.0967C4.1894 19.2724 4.42472 19.3725 4.67108 19.375H15.329C15.5753 19.3725 15.8107 19.2724 15.9833 19.0967C16.156 18.9209 16.2519 18.6839 16.25 18.4375V5.9375H3.75003V18.4375ZM5.00003 7.1875H15V18.125H5.00003V7.1875Z" fill={color}/>
    <path d="M7.8125 8.4375H6.5625V16.25H7.8125V8.4375Z" fill={color}/>
    <path d="M10.625 8.4375H9.375V16.25H10.625V8.4375Z" fill={color}/>
    <path d="M13.4375 8.4375H12.1875V16.25H13.4375V8.4375Z" fill={color}/>
    <path d="M12.8125 3.4375V1.5625C12.8125 1.0368 12.4419 0.625 11.9688 0.625H8.03125C7.55813 0.625 7.1875 1.0368 7.1875 1.5625V3.4375H2.5V4.6875H17.5V3.4375H12.8125ZM8.4375 1.875H11.5625V3.4375H8.4375V1.875Z" fill={color}/>
  </svg>
);

// Копировать 
export const CopyIcon = ({ width = 16, height = 16, color = "#374151", className = "" }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="5" y="5" width="9" height="9" rx="1" stroke={color} strokeWidth="1.2"/>
    <path d="M3 11V3C3 2.44772 3.44772 2 4 2H11" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

export const CheckCopyIcon = ({ width = 16, height = 16, color = "#16A34A", className = "" }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M13.5 4.5L6.5 11.5L3 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Плей
export const PlayIcon = ({ width = 17, height = 17, color = "white", className = "" }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 20 20" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M2 16.5024C2 17.0412 2.23013 17.4691 2.69038 17.7861C2.94431 17.9287 3.21411 18 3.49978 18C3.72197 18 3.94416 17.9445 4.16635 17.8336L16.1884 11.8431C16.4265 11.7163 16.6249 11.5341 16.7836 11.2964C16.9423 11.0586 17.0137 10.7892 16.9978 10.4881C16.982 10.187 16.9105 9.92552 16.7836 9.70365C16.6566 9.48178 16.4582 9.29952 16.1884 9.15689L4.16635 3.1664C3.94416 3.05547 3.72197 3 3.49978 3C3.22998 3 2.96018 3.07132 2.69038 3.21395C2.23013 3.51506 2 3.94295 2 4.49762V16.5024Z" fill={color}/>
  </svg>
);

// Отправить сообщение 
export const SendIcon = ({ width = 18, height = 18, color = "white", className = "" }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 20 20" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M2.5 17.5L18.3333 10L2.5 2.5V8.33333L13.3333 10L2.5 11.6667V17.5Z" fill={color}/>
  </svg>
);

// Группа пользователей
export const UsersIcon = ({ width = 16, height = 16, color = "#374151", className = "" }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M11.5 7C12.6046 7 13.5 6.10457 13.5 5C13.5 3.89543 12.6046 3 11.5 3" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M13 10.5C14 11 14.5 11.8 14.5 12.5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="7" cy="5" r="2.5" stroke={color} strokeWidth="1.2"/>
    <path d="M2.5 13.5C2.5 11.567 4.567 10 7 10C9.433 10 11.5 11.567 11.5 13.5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);


// Иконка "Шляпа"
export const HatIcon = ({ width = 48, height = 48, color = "white", className = "" }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 1000 1000" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g transform="translate(0.000000,511.000000) scale(0.100000,-0.100000)">
      <path 
        d="M4121.6,5048.5c-320.1-20.7-864.9-92.9-1161.8-154.9c-681.6-142-1161.8-366.6-1456.1-681.6c-253-271.1-276.3-462.1-108.4-952.7c191-557.7,289.2-1546.4,340.8-3402.7c20.6-740.9,33.6-704.8-281.4-862.3c-562.8-281.4-1040.4-697.1-1216-1055.9C112.2-2319.8,76-2523.7,114.8-2763.8c160.1-1037.9,1698.8-1812.4,4045.6-2039.6c436.3-41.3,1608.4-41.3,2052.5,2.6c725.4,67.1,1502.6,232.4,2026.6,428.6c534.4,201.4,885.5,413.1,1192.8,722.9c431.2,436.3,568,960.4,395,1512.9c-144.6,472.5-560.2,893.3-1166.9,1185c-157.5,77.5-242.7,103.3-335.6,103.3c-67.1,0-123.9-10.3-123.9-23.2c0-12.9,43.9-196.2,95.5-407.9c85.2-338.2,95.5-418.2,98.1-704.8c0-304.6-5.2-330.4-74.9-472.5c-180.7-369.2-619.6-648-1314.1-831.3c-562.8-149.7-1613.6-296.9-1732.3-242.7c-87.8,41.3-154.9,185.9-126.5,273.7c49,142,105.8,157.5,679,188.5c808.1,41.3,1200.5,111,1538.7,271.1c253,121.3,426,284,537,503.4c136.8,276.3,157.5,454.4,123.9,1123c-54.2,1055.9-62,1469-33.6,2044.8c54.2,1071.4,144.6,1626.5,415.6,2592c59.4,206.5,80,322.7,67.1,374.4c-10.3,46.5-100.7,157.5-229.8,281.4c-167.8,165.2-268.5,237.5-469.9,340.8c-524.1,268.5-1179.9,438.9-2052.5,539.6C5399.6,5038.1,4436.6,5066.5,4121.6,5048.5z M2340.2,3579.5c413.1-154.9,1089.5-325.3,1600.7-402.7c335.6-51.6,503.4-59.4,1045.6-62c1027.5,0,1753,136.8,2586.9,493.1c294.3,126.5,315,129.1,418.3,74.9c82.6-41.3,105.8-85.2,105.8-204c0-118.8-38.7-157.5-268.5-263.3c-1355.4-622.2-3147.1-746.1-4794.3-333C2384.1,3047.6,1829,3249,1746.4,3352.3c-74.9,98.1-67.1,203.9,25.8,296.9C1870.3,3747.3,1906.5,3742.1,2340.2,3579.5z" 
        fill={color} 
      />
    </g>
  </svg>
);

// Иконка "Буква"
export const LetterIcon = ({ width = 48, height = 48, color = "white", className = "" }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 1024 1024" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M829.44 911.36c45.245 0 81.92-36.675 81.92-81.92V194.56c0-45.245-36.675-81.92-81.92-81.92H194.56c-45.245 0-81.92 36.675-81.92 81.92v634.88c0 45.245 36.675 81.92 81.92 81.92h634.88zm0 40.96H194.56c-67.866 0-122.88-55.014-122.88-122.88V194.56c0-67.866 55.014-122.88 122.88-122.88h634.88c67.866 0 122.88 55.014 122.88 122.88v634.88c0 67.866-55.014 122.88-122.88 122.88z" 
      fill={color}
    />
    <path 
      d="M322.684 797.914L528.15 228.201c3.837-10.64-1.677-22.376-12.317-26.213s-22.376 1.677-26.213 12.317L284.154 784.018c-3.837 10.64 1.677 22.376 12.317 26.213s22.376-1.677 26.213-12.317z" 
      fill={color}
    />
    <path 
      d="M739.848 784.018L534.382 214.305c-3.837-10.64-15.573-16.155-26.213-12.317s-16.155 15.573-12.317 26.213l205.466 569.713c3.837 10.64 15.573 16.155 26.213 12.317s16.155-15.573 12.317-26.213z" 
      fill={color}
    />
    <path 
      d="M375.165 612.512h274.36c11.311 0 20.48-9.169 20.48-20.48s-9.169-20.48-20.48-20.48h-274.36c-11.311 0-20.48 9.169-20.48 20.48s9.169 20.48 20.48 20.48z" 
      fill={color}
    />
  </svg>
);

// Иконка "Карты"
export const CardsIcon = ({ width = 48, height = 48, color = "white", className = "" }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M9.4 7.53333C9.2 7.26667 8.8 7.26667 8.6 7.53333L6.225 10.7C6.09167 10.8778 6.09167 11.1222 6.225 11.3L8.6 14.4667C8.8 14.7333 9.2 14.7333 9.4 14.4667L11.775 11.3C11.9083 11.1222 11.9083 10.8778 11.775 10.7L9.4 7.53333Z" 
      fill={color}
    />
    <path 
      d="M4.09245 5.63868C4.03647 5.5547 4.03647 5.4453 4.09245 5.36133L4.79199 4.31202C4.89094 4.16359 5.10906 4.16359 5.20801 4.31202L5.90755 5.36132C5.96353 5.4453 5.96353 5.5547 5.90755 5.63867L5.20801 6.68798C5.10906 6.83641 4.89094 6.83641 4.79199 6.68798L4.09245 5.63868Z" 
      fill={color}
    />
    <path 
      d="M13.208 15.312C13.1091 15.1636 12.8909 15.1636 12.792 15.312L12.0924 16.3613C12.0365 16.4453 12.0365 16.5547 12.0924 16.6387L12.792 17.688C12.8909 17.8364 13.1091 17.8364 13.208 17.688L13.9075 16.6387C13.9635 16.5547 13.9635 16.4453 13.9075 16.3613L13.208 15.312Z" 
      fill={color}
    />
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M1 4C1 2.34315 2.34315 1 4 1H14C15.1323 1 16.1181 1.62732 16.6288 2.55337L20.839 3.68148C22.4394 4.11031 23.3891 5.75532 22.9603 7.35572L19.3368 20.8787C18.908 22.4791 17.263 23.4288 15.6626 23L8.19849 21H4C2.34315 21 1 19.6569 1 18V4ZM17 18V4.72339L20.3213 5.61334C20.8548 5.75628 21.1714 6.30461 21.0284 6.83808L17.405 20.361C17.262 20.8945 16.7137 21.2111 16.1802 21.0681L15.1198 20.784C16.222 20.3403 17 19.261 17 18ZM4 3C3.44772 3 3 3.44772 3 4V18C3 18.5523 3.44772 19 4 19H14C14.5523 19 15 18.5523 15 18V4C15 3.44772 14.5523 3 14 3H4Z" 
      fill={color}
    />
  </svg>
);


// Стрелка вниз 
export const ChevronIcon = ({ width = 20, height = 20, color = "#6B7280", className = "" }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 20 20" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M10.5 14L17.4338 7.06304L18 6.50311L16.8708 5.37702L16.3078 5.94007L10.5 11.7447L4.69224 5.94007L4.1292 5.37702L3 6.50311L3.56616 7.06304L10.5 14Z"
      fill={color}
    />
  </svg>
);

// Иконка профиля
export const ProfileIcon = ({ width = 20, height = 20, color = "#6B7280", className = "" }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 20 20" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M10 11.5625C12.2437 11.5625 14.0625 9.74366 14.0625 7.5C14.0625 5.25634 12.2437 3.4375 10 3.4375C7.75634 3.4375 5.9375 5.25634 5.9375 7.5C5.9375 9.74366 7.75634 11.5625 10 11.5625Z" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M3.4375 17.8125C3.4375 14.6875 5.9375 11.5625 10 11.5625C14.0625 11.5625 16.5625 14.6875 16.5625 17.8125" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);