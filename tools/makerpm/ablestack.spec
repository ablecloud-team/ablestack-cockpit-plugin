# Copyright (c) 2021 ABLECLOUD Co. Ltd
# 이 파일은 rpmbuild를 이용하여 ablestack-cockpit-plugin을 빌드하기 위한 내용을 정의한 spec파일입니다. 
# 최초 작성일 : 2021. 04. 02

Name: ablestack
Version: %{?version}%{!?version:4.0}
Release: %{?release}%{!?release:0.wip.el9.noarch}
Source0: %{name}-%{version}.tar.gz
Summary: ablestack package

Group: AbleCloud
License: None
URL: https://github.com/ablecloud-team/ablestack-cockpit-plugin.git
BuildRoot: %(mktemp -ud %{_tmppath}/%{name}-%{version}-%{release}-XXXXXX)
BuildRequires: /bin/bash
Requires: /bin/bash

%description
 ablestack-cockpit-plugin package

%define debug_package %{nil}
%define _unpackaged_files_terminate_build 0
%define _missing_doc_files_terminate_build 0

%prep
%setup -q

%build

#configure
#make %{?_smp_mflags}

%install
rm -rf $RPM_BUILD_ROOT
mkdir -p $RPM_BUILD_ROOT/usr/share/cockpit/ablestack
cp -r $RPM_BUILD_ROOT/../../../{README.md,css,images,main.html,manifest.json,sample,shell,src,tools,python} $RPM_BUILD_ROOT/usr/share/cockpit/ablestack

%post
#echo 'AbleStack script'
/usr/share/cockpit/ablestack/tools/makerpm/ablestack.sh&
#echo 'AbleStack complete!'

%clean
rm -rf $RPM_BUILD_ROOT

%files
%defattr(-,root,root,-)
#%doc

%attr(0755,root,root)/usr/share/cockpit/ablestack/*

%changelog
* Thu Apr 1 2021 ABLESTACK <ablecloud@ableclou.io> - 0.1
-Initial RPM

