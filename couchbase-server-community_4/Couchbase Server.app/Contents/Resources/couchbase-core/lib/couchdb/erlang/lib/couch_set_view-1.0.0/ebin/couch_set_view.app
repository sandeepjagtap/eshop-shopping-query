% Licensed under the Apache License, Version 2.0 (the "License"); you may not
% use this file except in compliance with the License. You may obtain a copy of
% the License at
%
%   http://www.apache.org/licenses/LICENSE-2.0
%
% Unless required by applicable law or agreed to in writing, software
% distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
% WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
% License for the specific language governing permissions and limitations under
% the License.

{application, couch_set_view, [
    {description, "Set views"},
    {vsn, "2.1.1r-562-g7ad0cfa"},
    {modules, [
        couch_set_view,
        couch_set_view_dev,
        couch_set_view_ddoc_cache,
        couch_set_view_http,
        couch_set_view_group,
        couch_set_view_updater,
        couch_set_view_updater_helper,
        couch_set_view_compactor,
        couch_set_view_util,
        couch_set_view_mapreduce,
        mapreduce_view
    ]},
    {registered, []},
    {applications, [kernel, stdlib]}
]}.
