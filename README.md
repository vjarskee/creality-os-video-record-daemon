# Creality OS Video Record Daemon

[![Lint](https://github.com/vjarskee/creality-os-video-record-daemon/actions/workflows/lint.yaml/badge.svg)](https://github.com/vjarskee/creality-os-video-record-daemon/actions/workflows/lint.yaml)

## Important

This project Dockerfile installs and builds third-party software, including:

- FFmpeg (LGPL/GPL depending on configuration)
- x264 (GPL)
- freetype (FreeType License)
- harfbuzz (MIT)
- font-noto (SIL Open Font License)

Please review their respective licenses and [License section](#license) before distributing any resulting binaries.

## Description

This is a simple project I wrote for my home use. It installs on your home server/PC/NAS/etc. as a Docker container and records video from a connected to printer camera with debug information. Well, to understand at what layer and under what circumstances something went wrong.

## Install and run

0. Install docker, lol
1. Clone the repository

```bash
git clone --recurse-submodules https://github.com/vjarskee/creality-os-video-record-daemon.git
```

2. Build image

```bash
docker build . --tag creality-os-video-record-daemon
```

3. Run container

```bash
docker run \
  --detach \
  --volume *your_videos_directory_path*:/usr/app/output:rw \
  --env TZ=*your_tz* \
  --env HOST=*your_printer_ip_or_hostname* \
  creality-os-video-record-daemon
```

## Customization

You can customize the video sign by replacing the `templates/txt_output.mustache` file with your own. Mustache is used for templating. The following variables are possible:

| Variable name      | Description                                                                           |
| ------------------ | ------------------------------------------------------------------------------------- |
| layer              | Current print layer                                                                   |
| total_layer        | Total number of layers                                                                |
| current_position_x | Current hotend position along the X axis                                              |
| current_position_y | Current hotend position along the Y axis                                              |
| current_position_z | Current hotend position along the Z axis                                              |
| nozzle_temp        | Current nozzle temperature                                                            |
| target_nozzle_temp | Target nozzle temperature                                                             |
| bed_temp           | Current hotbed temperature                                                            |
| target_bed_temp    | Target hotbed temperature                                                             |
| print_file_name    | Current print file name (like mymodel.gcode)                                          |
| print_job_time     | The amount of time how long has printing been going on (hh:mm:ss)                     |
| print_left_time    | The amount of time left until the end of printing (hh:mm:ss)                          |
| print_start_date   | Date and time of the start of printing (in js `Date.toLocaleString()` format)         |
| print_end_date     | Estimated date and time of the end of printing (in js `Date.toLocaleString()` format) |
| print_progress     | Print progress as a percentage                                                        |

## License

Licensed under the [MIT](LICENSE) license.

### Third-Party Components and Licensing

This repository includes a Dockerfile that builds and installs third-party software, including FFmpeg, which may be configured with GPL-licensed components (e.g. via --enable-gpl and --enable-version3), as well as external libraries such as x264. As a result, any binaries or Docker images built using this Dockerfile may be subject to the terms and conditions of the GNU General Public License v3.0 (GPLv3) and other applicable third-party licenses.

### No Distribution of Binaries

This repository does not distribute prebuilt binaries or Docker images. It only provides build instructions.

### User Responsibility

By using this Dockerfile, you acknowledge and agree that:

You are solely responsible for ensuring compliance with all applicable open source licenses of the software built using this repository. If you distribute any resulting binaries or container images, you must comply with the corresponding license obligations (including, but not limited to, GPLv3 requirements such as source code availability and license notices). Author of this project are not responsible for how built artifacts are used, distributed, or licensed.

### Optional: Building Without GPL Components

If you want to avoid GPL licensing obligations, you may modify the build configuration to exclude GPL components (for example, by disabling x264 and avoiding --enable-gpl). Refer to FFmpeg documentation for configuration options and licensing details.
