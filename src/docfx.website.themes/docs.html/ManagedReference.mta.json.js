function transform(rawModel, _attrs){
  if (!rawModel.metadata) {
    var model = {};
  } else {
    var model = rawModel.metadata;
  }

  model.layout = "Reference";
  model.title = rawModel.items[0].name + " " + rawModel.items[0].type;

  // If toc is not defined in model, read it from __attrs
  if (_attrs._tocPath && _attrs._tocPath.indexOf("~/") == 0){
    _attrs._tocPath = _attrs._tocPath.substring(2);
  }
  if (!rawModel.toc_asset_id){
    model.toc_asset_id = _attrs._tocPath;
  }

  model.toc_rel = _attrs._tocRel;
  model.platforms = rawModel.items[0].platform;
  model.langs = rawModel.items[0].langs;
  if (!model.breadcrumb_path) {
    model.breadcrumb_path = "/toc.html";
  }
  if (!rawModel.metadata) {
    model.content_git_url = getContentGitUrl(rawModel.items[0]);
  } else {
    model.content_git_url = getContentGitUrl(rawModel.items[0], rawModel.metadata.newFileRepository);
  }
  model.source_url = getViewSourceHref(rawModel.items[0]);
  model["ms.assetid"] = getMsAssetId(rawModel.items[0]);

  return {
    content: JSON.stringify(model)
  };

  function getContentGitUrl(item, newFileRepository) {
    if (!item) return '';
    if (!item.documentation || !item.documentation.remote) {
      return getNewFileUrl(item.uid, newFileRepository);
    } else {
      return getRemoteUrl(item.documentation.remote, item.documentation.startLine + 1);
    }
  }

  function getViewSourceHref(item) {
    /* jshint validthis: true */
    if (!item || !item.source || !item.source.remote) return '';
    return getRemoteUrl(item.source.remote, item.source.startLine - '0' + 1);
  }

  function getNewFileUrl(uid, newFileRepository) {
    // do not support VSO for now
    if (newFileRepository && newFileRepository.repo) {
      var repo = newFileRepository.repo;
      if (repo.substr(-4) === '.git') {
        repo = repo.substr(0, repo.length - 4);
      }
      var path = getGithubUrlPrefix(repo);
      if (path != '') {
        path += '/new';
        path += '/' + newFileRepository.branch;
        path += '/' + getOverrideFolder(newFileRepository.path);
        path += '/new?filename=' + getHtmlId(uid) + '.md';
        path += '&value=' + encodeURIComponent(getOverrideTemplate(uid));
      }
      return path;
    } else {
      return '';
    }
  }

  function getOverrideFolder(path) {
    if (!path) return "";
    path = path.replace('\\', '/');
    if (path.charAt(path.length - 1) == '/') path = path.substring(0, path.length - 1);
    return path;
  }
  
   function getHtmlId(input) {
     return input.replace(/\W/g, '_');
   }

  function getOverrideTemplate(uid) {
    if (!uid) return "";
    var content = "";
    content += "---\n";
    content += "uid: " + uid + "\n";
    content += "remarks: '*THIS* is remarks overriden in *MARKDOWN* file'\n";
    content += "---\n";
    content += "\n";
    content += "*Please type below more information about this API:*\n";
    content += "\n";
    return content;
  }

  function getRemoteUrl(remote, startLine) {
    if (remote && remote.repo) {
      var repo = remote.repo;
      if (repo.substr(-4) === '.git') {
        repo = repo.substr(0, repo.length - 4);
      }
      var linenum = startLine ? startLine : 0;
      if (repo.match(/https:\/\/.*\.visualstudio\.com\/.*/g)) {
        // TODO: line not working for vso
        return repo + '#path=/' + remote.path;
      }
      var path = getGithubUrlPrefix(repo);
      if (path != '') {
        path += '/blob' + '/' + remote.branch + '/' + remote.path;
        if (linenum > 0) path += '/#L' + linenum;
      }
      return path;
    } else {
      return '';
    }
  }

  function getGithubUrlPrefix(repo) {
    if (repo.match(/https:\/\/.*github\.com\/.*/g)) {
      return repo;
    }
    if (repo.match(/git@.*github\.com:.*/g)) {
      return 'https://' + repo.substr(4).replace(':', '/');
    }
    return '';
  }

  function getMsAssetId(item) {
    if (!item || !item.uid) return '';
    return item.uid;
  }
}
