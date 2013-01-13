cmake_minimum_required(VERSION 2.8.3)
project(mjpegcanvasjs)

## Find catkin macros and libraries
## if COMPONENTS list like find_package(catkin REQUIRED COMPONENTS xyz)
## is used, also find other catkin packages
find_package(catkin REQUIRED COMPONENTS)

###################################################
## Declare things to be passed to other projects ##
###################################################

## LIBRARIES: libraries you create in this project that dependent projects also need
## CATKIN_DEPENDS: catkin_packages dependent projects also need
## DEPENDS: system dependencies of this project that dependent projects also need
catkin_package()

#############
## Install ##
#############

## Mark a file for installation
install(FILES mjpegcanvas.js
  DESTINATION ${CATKIN_PACKAGE_SHARE_DESTINATION}
)

## Mark a directory for installation
install(DIRECTORY example/
  DESTINATION ${CATKIN_PACKAGE_SHARE_DESTINATION}/example
)
