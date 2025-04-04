export function key(
    enumType: Record<string, number>,
    enumValue: number,
): string | undefined {
    return Object.keys(enumType).find((key) => enumType[key] === enumValue)
}

export enum MsgType {
    validation = "validation",
    subscribe = "subscribe",
    unsubscribe = "unsubscribe",
    msg = "msg",
    req = "req",
    res = "res",
    vid = "vid",
    aud = "aud",
    err = "err",
    heartbeat = "heartbeat",
    rtc_inner_req = "rtc_inner_req",
    rtc_report = "rtc_report",
    add_error = "add_error",
    rm_error = "rm_error",
    errors = "errors",
}

export enum Topic {
    LOW_STATE = "rt/lf/lowstate",
    MULTIPLE_STATE = "rt/multiplestate",
    FRONT_PHOTO_REQ = "rt/api/videohub/request",
    ULIDAR_SWITCH = "rt/utlidar/switch",
    ULIDAR = "rt/utlidar/voxel_map",
    ULIDAR_ARRAY = "rt/utlidar/voxel_map_compressed",
    ULIDAR_STATE = "rt/utlidar/lidar_state",
    ROBOTODOM = "rt/utlidar/robot_pose",
    UWB_REQ = "rt/api/uwbswitch/request",
    UWB_STATE = "rt/uwbstate",
    LOW_CMD = "rt/lowcmd",
    WIRELESS_CONTROLLER = "rt/wirelesscontroller",
    SPORT_MOD = "rt/api/sport/request",
    SPORT_RESPONSE = "rt/api/sport/response",
    SPORT_MOD_STATE = "rt/sportmodestate",
    LF_SPORT_MOD_STATE = "rt/lf/sportmodestate",
    BASH_REQ = "rt/api/bashrunner/request",
    SELF_TEST = "rt/selftest",
    GRID_MAP = "rt/mapping/grid_map",
    SERVICE_STATE = "rt/servicestate",
    GPT_FEEDBACK = "rt/gptflowfeedback",
    VUI = "rt/api/vui/request",
    OBSTACLES_AVOID = "rt/api/obstacles_avoid/request",
    SLAM_QT_COMMAND = "rt/qt_command",
    SLAM_ADD_NODE = "rt/qt_add_node",
    SLAM_ADD_EDGE = "rt/qt_add_edge",
    SLAM_QT_NOTICE = "rt/qt_notice",
    SLAM_PC_TO_IMAGE_LOCAL = "rt/pctoimage_local",
    SLAM_ODOMETRY = "rt/lio_sam_ros2/mapping/odometry",
    ARM_COMMAND = "rt/arm_Command",
    ARM_FEEDBACK = "rt/arm_Feedback",
    AUDIO_HUB_REQ = "rt/api/audiohub/request",
    AUDIO_HUB_PLAY_STATE = "rt/audiohub/player/state",
    GAS_SENSOR = "rt/gas_sensor",
    GAS_SENSOR_REQ = "rt/api/gas_sensor/request",
    LIDAR_MAPPING_CMD = "rt/uslam/client_command",
    LIDAR_MAPPING_CLOUD_POINT = "rt/uslam/frontend/cloud_world_ds",
    LIDAR_MAPPING_ODOM = "rt/uslam/frontend/odom",
    LIDAR_MAPPING_PCD_FILE = "rt/uslam/cloud_map",
    LIDAR_MAPPING_SERVER_LOG = "rt/uslam/server_log",
    LIDAR_LOCALIZATION_ODOM = "rt/uslam/localization/odom",
    LIDAR_NAVIGATION_GLOBAL_PATH = "rt/uslam/navigation/global_path",
    LIDAR_LOCALIZATION_CLOUD_POINT = "rt/uslam/localization/cloud_world",
    PROGRAMMING_ACTUATOR_CMD = "rt/programming_actuator/command",
    ASSISTANT_RECORDER = "rt/api/assistant_recorder/request",
    MOTION_SWITCHER = "rt/api/motion_switcher/request",
    MOTION_SWITCHER_RESPONSE = "rt/api/motion_switcher/response",
    PET = "rt/api/pet/request",
}

export const ResponseMap = {
    [Topic.SPORT_MOD]: Topic.SPORT_RESPONSE,
    [Topic.MOTION_SWITCHER]: Topic.MOTION_SWITCHER_RESPONSE,
}

export enum SportCmd {
    Damp = 1001,
    BalanceStand = 1002,
    BalanceAvoid = 1048,
    StopMove = 1003,
    StandUp = 1004,
    StandDown = 1005,
    RecoveryStand = 1006,
    Euler = 1007,
    Move = 1008,
    Sit = 1009,
    RiseSit = 1010,
    SwitchGait = 1011,
    Trigger = 1012,
    BodyHeight = 1013,
    FootRaiseHeight = 1014,
    SpeedLevel = 1015,
    Hello = 1016,
    Stretch = 1017,
    TrajectoryFollow = 1018,
    ContinuousGait = 1019,
    Content = 1020,
    Wallow = 1021,
    Dance1 = 1022,
    Dance2 = 1023,
    GetBodyHeight = 1024,
    GetFootRaiseHeight = 1025,
    GetSpeedLevel = 1026,
    SwitchJoystick = 1027,
    Pose = 1028,
    Scrape = 1029,
    FrontFlip = 1030,
    LeftFlip = 1042,
    RightFlip = 1043,
    BackFlip = 1044,
    FrontJump = 1031,
    FrontPounce = 1032,
    WiggleHips = 1033,
    GetState = 1034,
    EconomicGait = 1035,
    LeadFollow = 1045,
    FingerHeart = 1036,
    Bound = 1304,
    MoonWalk = 1305,
    OnesidedStep = 1303,
    CrossStep = 1302,
    Handstand = 1301,
    StandOut = 1039,
    FreeWalk = 1045,
    Standup = 1050,
    CrossWalk = 1051,
}

export enum VUICmd {
    Color = 1007,
    Brightness = 1005,
}

export enum Color {
    WHITE = "white",
    RED = "red",
    YELLOW = "yellow",
    BLUE = "blue",
    GREEN = "green",
    CYAN = "cyan",
    PURPLE = "purple",
}

export type RequestData = {
    header?: { identity?: { id: number; api_id?: SportCmd } }
    parameter?: Record<string, unknown> | string
}

export type Msg<TYPE, DATA> = {
    // May need empty string if undefined (common in some libraries)
    topic?: Topic | ""
    //header?: { identity: { id: number; api_id?: SportCmd } }
    type: TYPE
    data?:
        | RequestData
        | string
        | Record<string, unknown>
}

export type ValidationMsg = Msg<
    MsgType.validation,
    "Validation Ok." | string
>
